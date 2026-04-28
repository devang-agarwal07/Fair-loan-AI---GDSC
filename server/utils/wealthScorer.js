/**
 * Regional land value multipliers (₹ per acre).
 * Based on approximate agricultural land market values across Indian states.
 * Source: State-level revenue records and agricultural land transaction data.
 *
 * Default is ₹50,000/acre for unknown regions.
 * This ensures wealth scores reflect real economic value differences
 * between regions — a key fairness consideration.
 */
const REGIONAL_LAND_VALUES = {
  'punjab':        200000, // High-value irrigated farmland
  'haryana':       180000,
  'uttar pradesh': 100000,
  'maharashtra':    80000,
  'karnataka':      70000,
  'tamil nadu':     90000,
  'telangana':      75000,
  'andhra pradesh': 65000,
  'madhya pradesh': 45000,
  'rajasthan':      40000,
  'gujarat':        85000,
  'bihar':          35000,
  'odisha':         30000,
  'vidarbha':       30000, // Drought-prone, lower value
  'jharkhand':      28000,
  'chhattisgarh':   25000,
  'west bengal':    60000,
  'assam':          35000,
  'kerala':        120000, // High land prices, smaller plots
};

/**
 * Get land value per acre for a region.
 * Tries exact region match first, then checks if any known state appears in the region string.
 */
function getLandValuePerAcre(region) {
  if (!region) return 50000;
  const lower = region.toLowerCase().trim();

  // Direct match
  if (REGIONAL_LAND_VALUES[lower]) return REGIONAL_LAND_VALUES[lower];

  // Check if any known region/state name appears in the string
  for (const [key, value] of Object.entries(REGIONAL_LAND_VALUES)) {
    if (lower.includes(key)) return value;
  }

  return 50000; // Default fallback
}

/**
 * Calculate composite wealth score for a single entry.
 * Formula: (land_size_acres × regional_land_value) + annual_income + savings + sum(assets) - (outstanding_loans × 0.8)
 *
 * Note: Land value is region-aware — 1 acre in Punjab is worth more than 1 acre in Vidarbha.
 * This prevents inflating/deflating wealth scores across regions.
 */
function calculateWealthScore(entry) {
  const landValuePerAcre = getLandValuePerAcre(entry.region);
  const landValue = (entry.land_size_acres || 0) * landValuePerAcre;
  const income = entry.annual_income_inr || 0;
  const savings = entry.total_savings_inr || 0;

  const assets = entry.assets || {};
  const totalAssets =
    (assets.livestock_value_inr || 0) +
    (assets.equipment_value_inr || 0) +
    (assets.vehicle_value_inr || 0) +
    (assets.gold_value_inr || 0) +
    (assets.property_other_inr || 0);

  const loanBurden = ((entry.existing_loans?.total_outstanding_inr) || 0) * 0.8;

  return landValue + income + savings + totalAssets - loanBurden;
}

/**
 * Normalize region string for matching.
 * Extracts state name if present (e.g., "Vidarbha, Maharashtra" → matches other Maharashtra entries).
 */
function normalizeRegion(region) {
  if (!region) return '';
  return region.toLowerCase().trim();
}

function getStateFromRegion(region) {
  if (!region) return '';
  const parts = region.split(',').map(p => p.trim().toLowerCase());
  // Return the last part as state (e.g., "Vidarbha, Maharashtra" → "maharashtra")
  return parts[parts.length - 1] || parts[0];
}

/**
 * Find matching entries from the same region/state.
 * First tries exact region match, then falls back to state-level match.
 */
function findRegionalEntries(dataset, applicantRegion) {
  const normalizedApplicant = normalizeRegion(applicantRegion);
  const applicantState = getStateFromRegion(applicantRegion);

  // Try exact region match first
  let matches = dataset.filter(e => normalizeRegion(e.region) === normalizedApplicant);

  // If fewer than 5, try state-level match
  if (matches.length < 5) {
    matches = dataset.filter(e => getStateFromRegion(e.region) === applicantState);
  }

  return matches;
}

/**
 * Core function: score an applicant relative to their community.
 *
 * @param {Object} applicantData — the applicant's form data
 * @param {Array} dataset — the full community dataset (loaded by the calling route)
 *
 * Returns:
 * - wealth_percentile (0–100)
 * - regional_median_income
 * - regional_median_wealth_score
 * - sample_size
 * - relative_wealth_label
 * - using_national_dataset (boolean flag)
 */
function scoreApplicant(applicantData, dataset = []) {
  let regionalEntries = findRegionalEntries(dataset, applicantData.region);
  let usingNational = false;

  // If fewer than 5 regional entries, use the full national dataset
  if (regionalEntries.length < 5) {
    regionalEntries = dataset;
    usingNational = true;
  }

  // Calculate wealth scores for all comparison entries
  const regionalScores = regionalEntries.map(e => ({
    id: e.id,
    score: calculateWealthScore(e),
    income: e.annual_income_inr || 0,
  }));

  // Calculate applicant's wealth score
  const applicantScore = calculateWealthScore(applicantData);

  // Rank all scores (ascending)
  const allScores = regionalScores.map(e => e.score).sort((a, b) => a - b);

  // Calculate percentile: % of entries the applicant scores above
  const belowCount = allScores.filter(s => s < applicantScore).length;
  const percentile = allScores.length > 0
    ? Math.round((belowCount / allScores.length) * 100)
    : 50;

  // Clamp percentile between 0 and 100
  const clampedPercentile = Math.min(100, Math.max(0, percentile));

  // Calculate medians
  const incomes = regionalScores.map(e => e.income).sort((a, b) => a - b);
  const medianIncome = incomes[Math.floor(incomes.length / 2)] || 0;
  const medianWealth = allScores[Math.floor(allScores.length / 2)] || 0;

  // Assign label
  let label;
  if (clampedPercentile <= 20) label = 'bottom 20%';
  else if (clampedPercentile <= 40) label = 'lower middle';
  else if (clampedPercentile <= 60) label = 'middle';
  else if (clampedPercentile <= 80) label = 'upper middle';
  else label = 'top 20%';

  // Calculate total asset value for the applicant (needed by geminiClient)
  const applicantAssets = applicantData.assets || {};
  const totalAssetValue =
    (applicantAssets.livestock_value_inr || 0) +
    (applicantAssets.equipment_value_inr || 0) +
    (applicantAssets.vehicle_value_inr || 0) +
    (applicantAssets.gold_value_inr || 0) +
    (applicantAssets.property_other_inr || 0);

  return {
    wealth_percentile: clampedPercentile,
    regional_median_income: medianIncome,
    regional_median_wealth_score: medianWealth,
    sample_size: regionalEntries.length,
    relative_wealth_label: label,
    using_national_dataset: usingNational,
    total_asset_value: totalAssetValue,
    applicant_wealth_score: applicantScore,
  };
}

module.exports = { scoreApplicant, calculateWealthScore };
