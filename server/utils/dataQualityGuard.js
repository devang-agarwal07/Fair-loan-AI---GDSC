/**
 * Data Quality Guard — detects "technically valid but fake" entries.
 *
 * Two layers of defense:
 *
 * 1. CROSS-FIELD CONSISTENCY: Checks if fields make sense *together*.
 *    Example: 50 acres of land + ₹10,000 income = impossible.
 *
 * 2. STATISTICAL OUTLIER DETECTION: Checks if the entry's key metrics
 *    are extreme outliers compared to the existing regional data.
 *    Uses the IQR (Interquartile Range) method — same method used in
 *    academic statistics to identify outliers.
 *
 * Neither of these BLOCKS legitimate edge-case users — they return
 * warnings that the POST handler uses to flag (but still save) mild
 * anomalies, while rejecting extreme/impossible combinations.
 */

// ============================================================
// LAYER 1: Cross-Field Consistency
// ============================================================

/**
 * Minimum expected income per acre of land (₹/acre/year).
 * Even the worst rain-fed single-crop land generates ~₹5,000/acre/year.
 * If someone claims 50 acres but ₹10,000 total income, that's impossible.
 */
const MIN_INCOME_PER_ACRE = 3000;

/**
 * Maximum realistic income per acre (₹/acre/year).
 * High-value crops in irrigated land can generate up to ~₹2,00,000/acre.
 * If someone claims 1 acre and ₹50,00,000 income, that's suspicious.
 */
const MAX_INCOME_PER_ACRE = 250000;

/**
 * Minimum monthly expense per household member (₹/person/month).
 * Even in the cheapest rural areas, ₹500/person/month is survival minimum.
 */
const MIN_EXPENSE_PER_PERSON = 500;

/**
 * Check cross-field consistency. Returns null if valid, or an error string if impossible.
 */
function checkCrossFieldConsistency(entry) {
  const errors = [];

  const land = entry.land_size_acres || 0;
  const income = entry.annual_income_inr || 0;
  const expenses = entry.monthly_expenses_inr || 0;
  const household = entry.household_size || 1;

  // Check 1: Large land + absurdly low income
  if (land >= 5 && income > 0 && income < land * MIN_INCOME_PER_ACRE) {
    errors.push(
      `Income ₹${income.toLocaleString()} is unrealistically low for ${land} acres of land. ` +
      `Even low-yield land generates at least ₹${(land * MIN_INCOME_PER_ACRE).toLocaleString()}/year.`
    );
  }

  // Check 2: Income absurdly high relative to land (any size)
  if (land > 0 && income > land * MAX_INCOME_PER_ACRE) {
    const offSeason = entry.off_season_income || 0;
    const totalAssets = Object.values(entry.assets || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    // Only flag if they also have no off-season income or assets to justify it
    if (offSeason < income * 0.3 && totalAssets < income * 0.5) {
      errors.push(
        `Income ₹${income.toLocaleString()} is unusually high for ${land} acre(s) of land ` +
        `(max expected: ₹${(land * MAX_INCOME_PER_ACRE).toLocaleString()}/year). ` +
        `No significant off-season income or assets to support this claim.`
      );
    }
  }

  // Check 3: Large household + zero/near-zero expenses
  if (household >= 4 && expenses > 0 && expenses < household * MIN_EXPENSE_PER_PERSON) {
    errors.push(
      `Monthly expenses ₹${expenses.toLocaleString()} are unrealistically low for a household of ${household}. ` +
      `Minimum survival cost is ~₹${(household * MIN_EXPENSE_PER_PERSON).toLocaleString()}/month.`
    );
  }

  // Check 4: Has many existing loans but zero outstanding balance
  const loanCount = entry.existing_loans?.count || 0;
  const loanOutstanding = entry.existing_loans?.total_outstanding_inr || 0;
  if (loanCount >= 3 && loanOutstanding === 0) {
    errors.push(
      `${loanCount} existing loans reported but ₹0 outstanding balance. ` +
      `This combination is unlikely — at least some balance is expected.`
    );
  }

  // Check 5: Savings impossibly high relative to low income
  const savings = entry.total_savings_inr || 0;
  if (savings > income * 10 && income < 200000) {
    errors.push(
      `Total savings ₹${savings.toLocaleString()} is over 10× annual income ₹${income.toLocaleString()}. ` +
      `Cannot accumulate this level of savings on low income without explanation.`
    );
  }

  // Check 6: Asset value suspiciously high relative to income and land
  const totalAssetValue = Object.values(entry.assets || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  if (totalAssetValue > income * 15 && land < 2) {
    errors.push(
      `Total asset value ₹${totalAssetValue.toLocaleString()} is over 15× annual income ` +
      `₹${income.toLocaleString()} with only ${land} acre(s) of land — this is suspicious.`
    );
  }

  // Check 7: Rainfed yield exceeding physical limits
  const avgYield = entry.average_yield_quintals_per_acre || 0;
  const hasIrrigation = entry.irrigation_access === true;
  if (avgYield > 80 && !hasIrrigation) {
    errors.push(
      `Average yield ${avgYield} quintals/acre with no irrigation access is physically impossible. ` +
      `Rainfed yield cap is approximately 40 quintals/acre for any crop.`
    );
  }

  return errors.length > 0 ? errors : null;
}


// ============================================================
// LAYER 2: Statistical Outlier Detection (IQR Method)
// ============================================================

/**
 * Calculate the IQR (Interquartile Range) bounds for an array of numbers.
 * Values outside [Q1 - 2.5*IQR, Q3 + 2.5*IQR] are considered extreme outliers.
 * We use 2.5x (not 1.5x) to be more lenient — we only want to catch EXTREME fakes.
 */
function getIQRBounds(values, multiplier = 2.5) {
  if (values.length < 5) return null; // Not enough data to detect outliers

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  return {
    lower: q1 - multiplier * iqr,
    upper: q3 + multiplier * iqr,
    q1,
    q3,
    iqr,
  };
}

/**
 * Check if the entry is a statistical outlier compared to the existing regional data.
 * Returns null if within range, or warning strings if outlier.
 *
 * Only checks income and land — the two most gameable fields.
 */
function checkStatisticalOutlier(entry, regionalEntries, existingDataset = []) {
  // Determine which dataset and IQR multiplier to use
  let comparisonEntries = regionalEntries;
  let iqrMultiplier = 2.5;
  let datasetLabel = 'this region';

  if (regionalEntries.length < 5) {
    // Fall back to full national dataset with a more lenient multiplier
    if (existingDataset.length < 5) {
      return null; // Not enough data at any level
    }
    comparisonEntries = existingDataset;
    iqrMultiplier = 4.0; // More lenient for national-level comparison
    datasetLabel = 'the national dataset';
  }

  const warnings = [];

  // Check income outlier
  const incomes = comparisonEntries.map(e => e.annual_income_inr || 0).filter(v => v > 0);
  const incomeBounds = getIQRBounds(incomes, iqrMultiplier);

  if (incomeBounds && entry.annual_income_inr > 0) {
    if (entry.annual_income_inr < incomeBounds.lower) {
      warnings.push(
        `Income ₹${entry.annual_income_inr.toLocaleString()} is an extreme low outlier for ${datasetLabel} ` +
        `(range: ₹${Math.round(incomeBounds.q1).toLocaleString()} – ₹${Math.round(incomeBounds.q3).toLocaleString()}).`
      );
    }
    if (entry.annual_income_inr > incomeBounds.upper) {
      warnings.push(
        `Income ₹${entry.annual_income_inr.toLocaleString()} is an extreme high outlier for ${datasetLabel} ` +
        `(range: ₹${Math.round(incomeBounds.q1).toLocaleString()} – ₹${Math.round(incomeBounds.q3).toLocaleString()}).`
      );
    }
  }

  // Check land outlier
  const lands = comparisonEntries.map(e => e.land_size_acres || 0).filter(v => v > 0);
  const landBounds = getIQRBounds(lands, iqrMultiplier);

  if (landBounds && entry.land_size_acres > 0) {
    if (entry.land_size_acres > landBounds.upper) {
      warnings.push(
        `Land ${entry.land_size_acres} acres is an extreme outlier for ${datasetLabel} ` +
        `(range: ${landBounds.q1.toFixed(1)} – ${landBounds.q3.toFixed(1)} acres).`
      );
    }
  }

  return warnings.length > 0 ? warnings : null;
}


// ============================================================
// PUBLIC API
// ============================================================

/**
 * Run all data quality checks on a sanitized entry.
 *
 * @param {Object} entry - The sanitized dataset entry
 * @param {Array} existingDataset - The current dataset (for statistical checks)
 * @returns {{ pass: boolean, errors: string[], warnings: string[] }}
 *   - pass: true if the entry should be saved
 *   - errors: fatal issues (entry will be REJECTED)
 *   - warnings: suspicious but not fatal (entry saved with flag)
 */
function validateDataQuality(entry, existingDataset = []) {
  const result = { pass: true, errors: [], warnings: [] };

  // Layer 1: Cross-field consistency
  const consistencyErrors = checkCrossFieldConsistency(entry);
  if (consistencyErrors) {
    // Cross-field failures are HARD REJECTIONS — these are impossible combinations
    result.pass = false;
    result.errors.push(...consistencyErrors);
  }

  // Layer 2: Statistical outlier detection
  // Find entries from the same region for comparison
  const regionLower = (entry.region || '').toLowerCase();
  const regionalEntries = existingDataset.filter(e =>
    e.region && e.region.toLowerCase().includes(regionLower.split(',')[0].trim())
  );

  const outlierWarnings = checkStatisticalOutlier(entry, regionalEntries, existingDataset);
  if (outlierWarnings) {
    // Outliers are SOFT WARNINGS — entry is saved but flagged
    result.warnings.push(...outlierWarnings);
    // Mark the entry with a quality flag so it can be filtered out if needed
    entry._quality_flag = 'outlier';
    entry._quality_warnings = outlierWarnings;
  }

  return result;
}

module.exports = { validateDataQuality };
