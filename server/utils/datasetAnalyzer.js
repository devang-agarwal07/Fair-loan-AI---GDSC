/**
 * Dataset Analyzer
 * 
 * Analyzes the health and quality of the community dataset.
 * Provides warnings about under-representation, skews, and data quality.
 */

const { calculateWealthScore } = require('./wealthScorer');

/**
 * Analyze dataset health — checks for representation issues.
 * @param {Array} dataset — the full community dataset (passed in from calling route)
 */
function analyzeDatasetHealth(dataset = []) {
  if (dataset.length === 0) {
    return { status: 'empty', warnings: ['Dataset is empty. No analysis possible.'] };
  }

  // Region distribution
  const regionCounts = {};
  dataset.forEach(e => {
    const state = (e.region || 'Unknown').split(',').pop().trim();
    regionCounts[state] = (regionCounts[state] || 0) + 1;
  });

  const warnings = [];
  const regionDetails = Object.entries(regionCounts).map(([region, count]) => {
    if (count < 5) warnings.push(`⚠️ "${region}" has only ${count} entries — results may be unreliable (need 5+)`);
    return { region, count, sufficient: count >= 5 };
  });

  // Income distribution
  const incomes = dataset.map(e => e.annual_income_inr || 0).sort((a, b) => a - b);
  const median = incomes[Math.floor(incomes.length / 2)];
  const mean = Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length);
  const min = incomes[0];
  const max = incomes[incomes.length - 1];

  // Wealth score distribution
  const scores = dataset.map(e => calculateWealthScore(e)).sort((a, b) => a - b);
  const wealthMedian = scores[Math.floor(scores.length / 2)];
  const wealthMean = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Check for skew
  if (mean > median * 1.5) {
    warnings.push('⚠️ Income distribution is right-skewed — a few high earners may distort averages');
  }

  // Check irrigation representation
  const withIrrigation = dataset.filter(e => e.irrigation_access).length;
  const irrigationPct = Math.round((withIrrigation / dataset.length) * 100);
  if (irrigationPct < 30 || irrigationPct > 70) {
    warnings.push(`⚠️ Irrigation access is unbalanced: ${irrigationPct}% have access`);
  }

  // Check ownership representation
  const owned = dataset.filter(e => e.land_ownership === 'owned').length;
  const ownedPct = Math.round((owned / dataset.length) * 100);

  // Check for defaults representation
  const withDefaults = dataset.filter(e => e.past_defaults).length;

  return {
    status: 'ok',
    total_entries: dataset.length,
    regions: regionDetails,
    total_regions: regionDetails.length,
    sufficient_regions: regionDetails.filter(r => r.sufficient).length,
    income_stats: {
      min, max, mean, median,
      range: max - min,
    },
    wealth_stats: {
      min: scores[0],
      max: scores[scores.length - 1],
      mean: wealthMean,
      median: wealthMedian,
    },
    representation: {
      irrigation_access_pct: irrigationPct,
      land_owned_pct: ownedPct,
      past_defaults_pct: Math.round((withDefaults / dataset.length) * 100),
    },
    warnings,
    health_score: Math.max(0, 100 - warnings.length * 15),
  };
}

/**
 * Compute whether the scoring algorithm is actually fair.
 * Tests: do poorer farmers (lower wealth percentile) actually get lower rates?
 * @param {Array} dataset — the full community dataset (passed in from calling route)
 */
function computeAlgorithmFairness(dataset = []) {
  if (dataset.length < 5) return { status: 'insufficient_data' };

  const { estimateInterestRate } = require('./fairnessMetrics');

  // Sort by wealth score
  const scored = dataset.map(e => ({
    region: e.region,
    wealth_score: calculateWealthScore(e),
    estimated_rate: estimateInterestRate(e, dataset),
    income: e.annual_income_inr || 0,
  })).sort((a, b) => a.wealth_score - b.wealth_score);

  // Split into quintiles (5 groups of 20%)
  const quintileSize = Math.ceil(scored.length / 5);
  const quintiles = [];
  for (let i = 0; i < 5; i++) {
    const slice = scored.slice(i * quintileSize, (i + 1) * quintileSize);
    const avgRate = slice.reduce((s, e) => s + e.estimated_rate, 0) / slice.length;
    const avgIncome = slice.reduce((s, e) => s + e.income, 0) / slice.length;
    quintiles.push({
      quintile: i + 1,
      label: ['Poorest 20%', 'Lower 20%', 'Middle 20%', 'Upper 20%', 'Richest 20%'][i],
      count: slice.length,
      avg_rate: Math.round(avgRate * 10) / 10,
      avg_income: Math.round(avgIncome),
      avg_wealth: Math.round(slice.reduce((s, e) => s + e.wealth_score, 0) / slice.length),
    });
  }

  // Check monotonicity: each quintile should have higher rate than previous
  let isMonotonic = true;
  for (let i = 1; i < quintiles.length; i++) {
    if (quintiles[i].avg_rate < quintiles[i - 1].avg_rate) {
      isMonotonic = false;
      break;
    }
  }

  // Rate spread: how much difference between poorest and richest
  const rateSpread = quintiles[quintiles.length - 1].avg_rate - quintiles[0].avg_rate;

  return {
    status: 'ok',
    quintiles,
    is_progressive: isMonotonic,
    rate_spread: Math.round(rateSpread * 10) / 10,
    poorest_rate: quintiles[0].avg_rate,
    richest_rate: quintiles[quintiles.length - 1].avg_rate,
    fairness_verified: isMonotonic && rateSpread > 5,
    explanation: isMonotonic
      ? `✅ The algorithm is progressive: poorest farmers get ${quintiles[0].avg_rate}% while richest get ${quintiles[quintiles.length - 1].avg_rate}% — a ${Math.round(rateSpread * 10) / 10}% spread ensuring economic justice.`
      : '⚠️ The algorithm is NOT consistently progressive — some wealthier groups may be getting lower rates.',
  };
}

module.exports = { analyzeDatasetHealth, computeAlgorithmFairness };
