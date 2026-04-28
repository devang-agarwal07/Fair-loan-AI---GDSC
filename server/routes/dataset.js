const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { calculateWealthScore } = require('../utils/wealthScorer');
const { validateDataQuality } = require('../utils/dataQualityGuard');
const { loadDataset, saveEntry } = require('../utils/firebaseDB');

// Valid Indian states and union territories for region validation
const VALID_STATES = [
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
  'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
  'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
  'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
  'delhi', 'jammu and kashmir', 'ladakh', 'chandigarh', 'puducherry',
  'lakshadweep', 'andaman and nicobar', 'dadra and nagar haveli',
];

function isValidIndianRegion(region) {
  const lower = region.toLowerCase();
  return VALID_STATES.some(state => lower.includes(state));
}

/**
 * GET /api/dataset
 * Returns all dataset entries (anonymised — no names).
 * Optionally filter by region with ?region=...
 */
router.get('/', async (req, res) => {
  try {
    let dataset = await loadDataset();
    const regionFilter = req.query.region;

    if (regionFilter) {
      const filterLower = regionFilter.toLowerCase();
      dataset = dataset.filter(
        e => e.region && e.region.toLowerCase().includes(filterLower)
      );
    }

    // Anonymise: strip names and exact locations, add computed wealth score label
    const anonymised = dataset.map(entry => {
      const { name, full_name, self_reported_wealth_tier, ...rest } = entry;
      const score = calculateWealthScore(entry);
      // Don't expose raw score — just include it for charts
      return { ...rest, _wealth_score: score };
    });

    res.json({
      success: true,
      count: anonymised.length,
      data: anonymised,
    });
  } catch (err) {
    console.error('Dataset fetch error:', err);
    res.status(500).json({ error: 'Failed to load dataset' });
  }
});

/**
 * GET /api/dataset/regions
 * Returns unique list of regions in the dataset.
 */
router.get('/regions', async (req, res) => {
  try {
    const dataset = await loadDataset();
    const regions = [...new Set(dataset.map(e => e.region).filter(Boolean))];
    res.json({ success: true, regions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load regions' });
  }
});

/**
 * GET /api/dataset/stats
 * Returns dataset statistics.
 */
router.get('/stats', async (req, res) => {
  try {
    const dataset = await loadDataset();
    const regions = [...new Set(dataset.map(e => e.region).filter(Boolean))];
    const scores = dataset.map(e => calculateWealthScore(e)).sort((a, b) => a - b);
    const incomes = dataset.map(e => e.annual_income_inr || 0).sort((a, b) => a - b);

    // Use median instead of mean — resistant to outliers
    const median = (arr) => {
      if (arr.length === 0) return 0;
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 !== 0 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2);
    };

    res.json({
      success: true,
      total_entries: dataset.length,
      unique_regions: regions.length,
      avg_income: median(incomes),
      avg_wealth_score: median(scores),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

/**
 * Sanitize and validate a dataset entry.
 * Uses a WHITELIST approach — only explicitly allowed fields are kept.
 * All numbers are clamped to realistic, safe ranges.
 */
function sanitizeDatasetEntry(raw) {
  // Helper: clamp a number to a safe range, default to fallback if NaN
  const clampNum = (val, min, max, fallback = 0) => {
    const n = Number(val);
    if (isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  };

  // Helper: validate string against allowed values
  const enumVal = (val, allowed, fallback) =>
    allowed.includes(val) ? val : fallback;

  // Helper: sanitize a string (trim, cap length)
  const safeStr = (val, maxLen = 100) =>
    typeof val === 'string' ? val.trim().substring(0, maxLen) : '';

  // Helper: sanitize an array of strings
  const safeStrArray = (arr, allowed) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(v => typeof v === 'string' && allowed.includes(v.toLowerCase()))
      .map(v => v.toLowerCase());
  };

  // Build the sanitized entry — ONLY whitelisted fields survive
  return {
    id: uuidv4(),
    submitted_at: new Date().toISOString(),
    region: safeStr(raw.region) || null,                          // Required — checked later
    land_size_acres: clampNum(raw.land_size_acres, 0, 1000),      // 0–1000 acres
    land_ownership: enumVal(raw.land_ownership, ['owned', 'leased', 'shared'], 'owned'),
    crop_types: safeStrArray(raw.crop_types, ['wheat', 'rice', 'cotton', 'sugarcane', 'vegetables', 'pulses', 'other']),
    annual_income_inr: clampNum(raw.annual_income_inr, 0, 100000000),  // 0–10 Crore
    income_regularity: enumVal(raw.income_regularity, ['seasonal', 'year-round', 'irregular'], 'seasonal'),
    off_season_income: clampNum(raw.off_season_income, 0, 50000000),
    total_savings_inr: clampNum(raw.total_savings_inr, 0, 100000000),
    assets: {
      livestock_value_inr: clampNum(raw.assets?.livestock_value_inr ?? raw.livestock_value_inr, 0, 50000000),
      equipment_value_inr: clampNum(raw.assets?.equipment_value_inr ?? raw.equipment_value_inr, 0, 50000000),
      vehicle_value_inr: clampNum(raw.assets?.vehicle_value_inr ?? raw.vehicle_value_inr, 0, 50000000),
      gold_value_inr: clampNum(raw.assets?.gold_value_inr ?? raw.gold_value_inr, 0, 50000000),
      property_other_inr: clampNum(raw.assets?.property_other_inr ?? raw.property_other_inr, 0, 100000000),
    },
    monthly_expenses_inr: clampNum(raw.monthly_expenses_inr, 0, 10000000),
    household_size: clampNum(raw.household_size, 1, 50, 1),
    existing_loans: {
      count: clampNum(raw.existing_loans?.count ?? raw.existing_loan_count, 0, 20),
      total_outstanding_inr: clampNum(raw.existing_loans?.total_outstanding_inr ?? raw.existing_loan_outstanding, 0, 100000000),
      sources: safeStrArray(
        raw.existing_loans?.sources || [],
        ['bank', 'microfinance', 'moneylender', 'family']
      ),
    },
    past_defaults: raw.past_defaults === true || raw.past_defaults === 'true',
    irrigation_access: raw.irrigation_access !== false && raw.irrigation_access !== 'false',
    market_distance_km: clampNum(raw.market_distance_km, 0, 500),
    average_yield_quintals_per_acre: clampNum(raw.average_yield_quintals_per_acre, 0, 200),
  };
}

/**
 * POST /api/dataset
 * Add a new community data submission (crowd-sourcing).
 * All input is sanitized through a strict whitelist before storage.
 */
router.post('/', async (req, res) => {
  try {
    // Step 1: Sanitize — rebuild from scratch with only allowed fields
    const entry = sanitizeDatasetEntry(req.body);

    // Step 2: Basic required-field validation
    if (!entry.region) {
      return res.status(400).json({ error: 'Region is required' });
    }
    if (!isValidIndianRegion(entry.region)) {
      return res.status(400).json({ 
        error: 'Invalid region. Please select a valid Indian state or district.',
        hint: 'Use the dropdown to select your region, or enter a format like "District, State".',
      });
    }
    if (entry.land_size_acres <= 0) {
      return res.status(400).json({ error: 'Land size must be greater than 0' });
    }
    if (entry.annual_income_inr <= 0) {
      return res.status(400).json({ error: 'Annual income must be greater than 0' });
    }

    // Step 3: Data quality checks — cross-field consistency + outlier detection
    const existingDataset = await loadDataset();
    const quality = validateDataQuality(entry, existingDataset);

    // If cross-field check fails → HARD REJECT (impossible data)
    if (!quality.pass) {
      return res.status(422).json({
        error: 'Data quality check failed',
        reasons: quality.errors,
        hint: 'The values you entered are inconsistent with each other. Please verify and try again.',
      });
    }

    // Step 4: Save entry to Firestore
    const saved = await saveEntry(entry);

    // Build response — include warnings if outlier detected
    const response = {
      success: true,
      message: 'Thank you for contributing! Your data helps make loans fairer for everyone.',
      dataset_size: existingDataset.length + 1,
    };

    if (quality.warnings.length > 0) {
      response.warnings = quality.warnings;
      response.message += ' (Note: Some values were flagged as unusual for your region.)';
    }

    res.json(response);
  } catch (err) {
    console.error('Dataset submission error:', err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

module.exports = router;
