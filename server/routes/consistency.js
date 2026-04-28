const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { scoreApplicant } = require('../utils/wealthScorer');
const { filterBias } = require('../utils/biasFilter');
const { getLoanProfile } = require('../utils/geminiClient');
const { loadDataset } = require('../utils/firebaseDB');

// ============================================================
// CONSISTENCY CACHE — prevents repeated triple-Gemini calls
// ============================================================
const CONSISTENCY_CACHE = new Map();
const CONSISTENCY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CONSISTENCY_CACHE_MAX = 200;

function getConsistencyCacheKey(input) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function getFromConsistencyCache(key) {
  const entry = CONSISTENCY_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CONSISTENCY_CACHE_TTL_MS) {
    CONSISTENCY_CACHE.delete(key);
    return null;
  }
  return entry.result;
}

function setInConsistencyCache(key, result) {
  if (CONSISTENCY_CACHE.size >= CONSISTENCY_CACHE_MAX) {
    const oldestKey = CONSISTENCY_CACHE.keys().next().value;
    CONSISTENCY_CACHE.delete(oldestKey);
  }
  CONSISTENCY_CACHE.set(key, { result, timestamp: Date.now() });
}

/**
 * POST /api/consistency-check
 * Run the same profile through Gemini multiple times to check consistency.
 * Body: same as /api/profile
 */
router.post('/', async (req, res) => {
  try {
    const applicantData = req.body;
    if (!applicantData.region || (!applicantData.loan_amount && !applicantData.loan_amount_requested)) {
      return res.status(400).json({ error: 'Region and loan amount are required' });
    }

    // Check cache first
    const cacheKey = getConsistencyCacheKey(applicantData);
    const cachedResult = getFromConsistencyCache(cacheKey);
    if (cachedResult) {
      console.log('Consistency cache hit — returning cached result');
      return res.json({ ...cachedResult, cached: true });
    }

    const dataset = await loadDataset();
    const wealthContext = scoreApplicant(applicantData, dataset);
    const cleanedData = filterBias(applicantData);
    const loanRequest = {
      loan_amount: applicantData.loan_amount || applicantData.loan_amount_requested || 0,
      purpose: applicantData.loan_purpose || applicantData.purpose || 'Not specified',
    };

    const RUNS = 3;
    const results = [];
    const errors = [];

    for (let i = 0; i < RUNS; i++) {
      try {
        const profile = await getLoanProfile(cleanedData, wealthContext, loanRequest);
        results.push(profile);
      } catch (err) {
        errors.push({ run: i + 1, error: err.message });
      }
      // Small delay between calls
      if (i < RUNS - 1) await new Promise(r => setTimeout(r, 2000));
    }

    if (results.length === 0) {
      return res.status(500).json({
        error: 'All AI calls failed. Rate limit may be active.',
        errors,
      });
    }

    // Compute consistency metrics
    const rates = results.map(r => r.interest_rate_annual_percent);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const rateVariance = rates.reduce((sum, r) => sum + Math.pow(r - avgRate, 2), 0) / rates.length;
    const rateStdDev = Math.sqrt(rateVariance);

    const limits = results.map(r => r.loan_limit_inr);
    const avgLimit = limits.reduce((a, b) => a + b, 0) / limits.length;

    const fairnessScores = results.map(r => r.fairness_score);
    const avgFairness = fairnessScores.reduce((a, b) => a + b, 0) / fairnessScores.length;

    // Consistency score: 100 - (rate std dev * 10), clamped to 0-100
    const consistencyScore = Math.round(Math.max(0, Math.min(100, 100 - rateStdDev * 20)));

    const responsePayload = {
      success: true,
      runs_completed: results.length,
      runs_failed: errors.length,
      results,
      consistency: {
        score: consistencyScore,
        label: consistencyScore >= 85 ? 'Highly Consistent' : consistencyScore >= 65 ? 'Moderately Consistent' : 'Inconsistent',
        interest_rate: { avg: Math.round(avgRate * 10) / 10, std_dev: Math.round(rateStdDev * 10) / 10, values: rates },
        loan_limit: { avg: Math.round(avgLimit), values: limits },
        fairness_score: { avg: Math.round(avgFairness * 10) / 10, values: fairnessScores },
      },
      wealth_context: {
        wealth_percentile: wealthContext.wealth_percentile,
        relative_wealth_label: wealthContext.relative_wealth_label,
        sample_size: wealthContext.sample_size,
      },
    };

    // Cache the result
    setInConsistencyCache(cacheKey, responsePayload);

    res.json(responsePayload);
  } catch (err) {
    console.error('Consistency check error:', err);
    res.status(500).json({ error: err.message || 'Consistency check failed' });
  }
});

module.exports = router;
