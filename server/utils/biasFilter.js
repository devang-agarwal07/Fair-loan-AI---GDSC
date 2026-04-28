/**
 * Bias Filter — uses a WHITELIST approach to construct a clean data object
 * before sending applicant data to Gemini AI.
 *
 * Philosophy: Only explicitly approved fields reach the AI.
 * If a developer adds "caste", "gender", "religion", or ANY new field
 * to the frontend form, it will be automatically dropped here
 * unless someone explicitly adds it to the whitelist below.
 *
 * This is a "default-deny" security posture — the safest approach.
 *
 * Removes (by not including):
 * - Name, full_name, or any PII
 * - Self-reported wealth tier (prevents anchoring bias)
 * - GPS, village, exact_location
 * - Any unknown/unexpected fields
 *
 * Adds:
 * - moneylender_dependency flag: if moneylender loans > 50% of total loans
 * - rural_remoteness flag: if market_distance_km > 30
 * - irrigation_disadvantage flag: if irrigation_access is false
 */
function filterBias(applicantData) {
  // --- WHITELIST: Build a brand new object with ONLY approved fields ---
  // Nothing from the original object passes through unless explicitly listed here.
  const cleaned = {
    // Location (district-level only — no village or GPS)
    region: applicantData.region || 'Unknown',

    // Land
    land_size_acres: Number(applicantData.land_size_acres) || 0,
    land_ownership: applicantData.land_ownership || 'unknown',

    // Crops
    crop_types: Array.isArray(applicantData.crop_types) ? [...applicantData.crop_types] : [],

    // Income
    annual_income_inr: Number(applicantData.annual_income_inr) || 0,
    income_regularity: applicantData.income_regularity || 'unknown',
    off_season_income: Number(applicantData.off_season_income) || 0,

    // Savings & Assets
    total_savings_inr: Number(applicantData.total_savings_inr) || 0,
    assets: {
      livestock_value_inr: Number(applicantData.assets?.livestock_value_inr) || 0,
      equipment_value_inr: Number(applicantData.assets?.equipment_value_inr) || 0,
      vehicle_value_inr: Number(applicantData.assets?.vehicle_value_inr) || 0,
      gold_value_inr: Number(applicantData.assets?.gold_value_inr) || 0,
      property_other_inr: Number(applicantData.assets?.property_other_inr) || 0,
    },

    // Expenses
    monthly_expenses_inr: Number(applicantData.monthly_expenses_inr) || 0,
    household_size: Number(applicantData.household_size) || 1,

    // Existing debt
    existing_loans: {
      count: Number(applicantData.existing_loans?.count) || 0,
      total_outstanding_inr: Number(applicantData.existing_loans?.total_outstanding_inr) || 0,
      sources: Array.isArray(applicantData.existing_loans?.sources)
        ? [...applicantData.existing_loans.sources]
        : [],
    },

    // Risk indicators
    past_defaults: applicantData.past_defaults === true,
    irrigation_access: applicantData.irrigation_access !== false,

    // Geography (distance only, not location)
    market_distance_km: Number(applicantData.market_distance_km) || 0,

    // Productivity
    average_yield_quintals_per_acre: Number(applicantData.average_yield_quintals_per_acre) || 0,
  };

  // --- ADD STRUCTURAL FLAGS ---
  // These flags help the AI give MORE favourable terms to disadvantaged farmers.

  // Moneylender dependency flag
  const loanSources = cleaned.existing_loans.sources;
  const moneylenderCount = loanSources.filter(
    s => typeof s === 'string' && s.toLowerCase() === 'moneylender'
  ).length;
  const totalLoanSources = loanSources.length;
  cleaned.moneylender_flag =
    totalLoanSources > 0 && moneylenderCount / totalLoanSources > 0.5;

  // Rural remoteness flag
  cleaned.remoteness_flag = cleaned.market_distance_km > 30;

  // Irrigation disadvantage flag
  cleaned.irrigation_disadvantage = cleaned.irrigation_access === false;

  return cleaned;
}

module.exports = { filterBias };
