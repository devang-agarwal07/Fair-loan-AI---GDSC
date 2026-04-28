const express = require('express');
const router = express.Router();
const { generateBiasReport } = require('../utils/fairnessMetrics');
const { analyzeDatasetHealth, computeAlgorithmFairness } = require('../utils/datasetAnalyzer');
const { loadDataset } = require('../utils/firebaseDB');

/**
 * POST /api/audit
 * Run bias analysis on a provided dataset (or the built-in community dataset).
 * Body: { dataset: [...] } or { use_community_data: true }
 */
router.post('/', async (req, res) => {
  try {
    let dataset;
    if (req.body.use_community_data) {
      dataset = await loadDataset();
    } else if (req.body.dataset && Array.isArray(req.body.dataset)) {
      dataset = req.body.dataset;
    } else {
      return res.status(400).json({ error: 'Provide a dataset array or set use_community_data: true' });
    }

    const report = generateBiasReport(dataset);
    res.json({ success: true, report });
  } catch (err) {
    console.error('Audit error:', err);
    res.status(500).json({ error: 'Failed to generate bias report' });
  }
});

/**
 * GET /api/audit/health
 * Get dataset health analysis.
 */
router.get('/health', async (req, res) => {
  try {
    const dataset = await loadDataset();
    const health = analyzeDatasetHealth(dataset);
    res.json({ success: true, ...health });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ error: 'Failed to analyze dataset health' });
  }
});

/**
 * GET /api/audit/fairness
 * Get algorithm fairness verification (quintile analysis).
 */
router.get('/fairness', async (req, res) => {
  try {
    const dataset = await loadDataset();
    const fairness = computeAlgorithmFairness(dataset);
    res.json({ success: true, ...fairness });
  } catch (err) {
    console.error('Fairness check error:', err);
    res.status(500).json({ error: 'Failed to compute fairness metrics' });
  }
});

module.exports = router;
