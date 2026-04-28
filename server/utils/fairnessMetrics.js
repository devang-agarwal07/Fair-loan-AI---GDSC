/**
 * Fairness Metrics Engine
 * 
 * Computes mathematical fairness metrics on lending datasets.
 * These are COMPUTED values, not AI-generated — provably fair.
 * 
 * Key metrics:
 * - Demographic Parity: Do different groups get similar outcomes?
 * - Disparate Impact Ratio: Is the worst-off group within 80% of the best?
 * - Interest Rate Gap: Average rate difference between groups
 * - Outlier Detection: Flag data points that seem discriminatory
 */

const { calculateWealthScore } = require('./wealthScorer');

/**
 * Group dataset entries by a field value.
 * For region, extracts the state (last part after comma).
 */
function groupBy(dataset, field) {
  const groups = {};
  dataset.forEach(entry => {
    let key;
    if (field === 'region_state') {
      key = (entry.region || 'Unknown').split(',').pop().trim();
    } else if (field === 'land_ownership') {
      key = entry.land_ownership || 'unknown';
    } else if (field === 'income_bracket') {
      const income = entry.annual_income_inr || 0;
      if (income < 50000) key = 'Below ₹50k';
      else if (income < 150000) key = '₹50k–₹1.5L';
      else if (income < 500000) key = '₹1.5L–₹5L';
      else key = 'Above ₹5L';
    } else if (field === 'wealth_tier') {
      const score = calculateWealthScore(entry);
      if (score < 100000) key = 'Very Low';
      else if (score < 300000) key = 'Low';
      else if (score < 700000) key = 'Medium';
      else if (score < 1500000) key = 'High';
      else key = 'Very High';
    } else if (field === 'irrigation_access') {
      key = entry.irrigation_access ? 'With Irrigation' : 'Without Irrigation';
    } else if (field === 'past_defaults') {
      key = entry.past_defaults ? 'Has Defaulted' : 'No Defaults';
    } else {
      key = String(entry[field] || 'Unknown');
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
}

/**
 * Simulate what interest rate the scoring algorithm would recommend
 * for a given entry, based purely on wealth percentile.
 * 
 * Formula: Linear interpolation between 4% (poorest) and 18% (wealthiest)
 * This is a deterministic alternative to calling Gemini.
 */
function estimateInterestRate(entry, dataset) {
  const scores = dataset.map(e => calculateWealthScore(e)).sort((a, b) => a - b);
  const entryScore = calculateWealthScore(entry);
  const belowCount = scores.filter(s => s < entryScore).length;
  const percentile = (belowCount / scores.length) * 100;

  // Linear: 4% at percentile 0, 18% at percentile 100
  const rate = 4 + (percentile / 100) * 14;
  return Math.round(rate * 10) / 10;
}

/**
 * Compute Demographic Parity across groups.
 * 
 * Checks if the average interest rate is similar across all groups.
 * Perfect parity = 0 (all groups get the same average rate).
 * 
 * Returns: parity score (0-1, where 0 = perfect parity) and group details.
 */
function computeDemographicParity(dataset, groupField) {
  const groups = groupBy(dataset, groupField);
  const groupStats = {};
  const rates = [];

  for (const [name, entries] of Object.entries(groups)) {
    const avgRate = entries.reduce((sum, e) => sum + estimateInterestRate(e, dataset), 0) / entries.length;
    groupStats[name] = {
      count: entries.length,
      avg_rate: Math.round(avgRate * 10) / 10,
      avg_income: Math.round(entries.reduce((s, e) => s + (e.annual_income_inr || 0), 0) / entries.length),
    };
    rates.push(avgRate);
  }

  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const parity = maxRate > 0 ? (maxRate - minRate) / maxRate : 0;

  return {
    group_field: groupField,
    groups: groupStats,
    parity_score: Math.round(parity * 100) / 100,
    parity_label: parity < 0.1 ? 'Excellent' : parity < 0.2 ? 'Good' : parity < 0.35 ? 'Moderate' : 'Poor',
    max_rate_gap: Math.round((maxRate - minRate) * 10) / 10,
  };
}

/**
 * Compute Disparate Impact Ratio.
 * 
 * The "80% rule" — the ratio of the favorable outcome rate for the
 * worst-off group vs the best group should be >= 0.8.
 * 
 * In lending: we check if the lowest-rate group's avg rate is within
 * 80% of the highest-rate group.
 */
function computeDisparateImpact(dataset, groupField) {
  const groups = groupBy(dataset, groupField);
  const groupRates = {};

  for (const [name, entries] of Object.entries(groups)) {
    // "Favorable outcome" = getting a rate below 10% (median of our range)
    const favorableCount = entries.filter(e => estimateInterestRate(e, dataset) < 10).length;
    groupRates[name] = {
      count: entries.length,
      favorable_count: favorableCount,
      favorable_rate: Math.round((favorableCount / entries.length) * 100),
    };
  }

  const rates = Object.values(groupRates).map(g => g.favorable_rate);
  const maxFavorable = Math.max(...rates);
  const minFavorable = Math.min(...rates);

  const ratio = maxFavorable > 0 ? minFavorable / maxFavorable : 1;

  // Find which groups are disadvantaged
  const disadvantaged = Object.entries(groupRates)
    .filter(([, g]) => maxFavorable > 0 && (g.favorable_rate / maxFavorable) < 0.8)
    .map(([name]) => name);

  return {
    group_field: groupField,
    groups: groupRates,
    impact_ratio: Math.round(ratio * 100) / 100,
    passes_80_percent_rule: ratio >= 0.8,
    disadvantaged_groups: disadvantaged,
    label: ratio >= 0.8 ? 'Fair' : ratio >= 0.6 ? 'Marginal' : 'Unfair',
  };
}

/**
 * Detect statistical outliers — entries whose estimated rate
 * deviates significantly from what their wealth percentile predicts.
 */
function detectOutliers(dataset) {
  const ratesWithEntries = dataset.map(e => ({
    id: e.id,
    region: e.region,
    income: e.annual_income_inr,
    wealth_score: calculateWealthScore(e),
    estimated_rate: estimateInterestRate(e, dataset),
  }));

  const rates = ratesWithEntries.map(r => r.estimated_rate);
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const stdDev = Math.sqrt(rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length);

  const outliers = ratesWithEntries.filter(r =>
    Math.abs(r.estimated_rate - mean) > 2 * stdDev
  );

  return {
    total_entries: dataset.length,
    mean_rate: Math.round(mean * 10) / 10,
    std_dev: Math.round(stdDev * 10) / 10,
    outlier_count: outliers.length,
    outliers,
  };
}

/**
 * Generate a complete bias report for a dataset.
 * Runs all metrics across multiple group dimensions.
 */
function generateBiasReport(dataset) {
  if (!dataset || dataset.length === 0) {
    return { error: 'Dataset is empty', metrics: [] };
  }

  const dimensions = [
    'region_state',
    'land_ownership',
    'income_bracket',
    'irrigation_access',
    'past_defaults',
  ];

  const parityResults = dimensions.map(d => computeDemographicParity(dataset, d));
  const impactResults = dimensions.map(d => computeDisparateImpact(dataset, d));
  const outlierAnalysis = detectOutliers(dataset);

  // Overall fairness score (0-100)
  const avgParity = parityResults.reduce((s, p) => s + p.parity_score, 0) / parityResults.length;
  const avgImpact = impactResults.reduce((s, i) => s + i.impact_ratio, 0) / impactResults.length;
  const overallScore = Math.round(((1 - avgParity) * 50 + avgImpact * 50));

  // Count issues
  const biasFlags = [];
  parityResults.forEach(p => {
    if (p.parity_label === 'Poor') biasFlags.push(`High rate disparity across ${p.group_field} (gap: ${p.max_rate_gap}%)`);
  });
  impactResults.forEach(i => {
    if (!i.passes_80_percent_rule) {
      biasFlags.push(`Disparate impact detected in ${i.group_field}: ${i.disadvantaged_groups.join(', ')} disadvantaged`);
    }
  });

  return {
    summary: {
      dataset_size: dataset.length,
      overall_fairness_score: overallScore,
      fairness_grade: overallScore >= 80 ? 'A' : overallScore >= 65 ? 'B' : overallScore >= 50 ? 'C' : 'D',
      total_bias_flags: biasFlags.length,
      bias_flags: biasFlags,
    },
    demographic_parity: parityResults,
    disparate_impact: impactResults,
    outlier_analysis: outlierAnalysis,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  computeDemographicParity,
  computeDisparateImpact,
  detectOutliers,
  generateBiasReport,
  estimateInterestRate,
  groupBy,
};
