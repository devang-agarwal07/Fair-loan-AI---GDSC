const express = require('express');
const router = express.Router();
const { scoreApplicant } = require('../utils/wealthScorer');
const { filterBias } = require('../utils/biasFilter');
const { getLoanProfile } = require('../utils/geminiClient');
const { loadDataset } = require('../utils/firebaseDB');

/**
 * POST /api/profile
 * Receives farmer form data, runs wealth scoring + bias filtering,
 * then calls Gemini AI for fair loan profiling.
 */
router.post('/', async (req, res) => {
  try {
    const applicantData = req.body;

    // Validate required fields
    if (!applicantData.region) {
      return res.status(400).json({ error: 'Region is required' });
    }
    if (!applicantData.loan_amount && !applicantData.loan_amount_requested) {
      return res.status(400).json({ error: 'Loan amount is required' });
    }

    // Load dataset from Firestore for community comparison
    const dataset = await loadDataset();

    // Step 1: Run wealth scorer to get community context
    const wealthContext = scoreApplicant(applicantData, dataset);

    // Step 2: Run bias filter to clean data
    const cleanedData = filterBias(applicantData);

    // Step 3: Prepare loan request object
    const loanRequest = {
      loan_amount: applicantData.loan_amount || applicantData.loan_amount_requested || 0,
      purpose: applicantData.loan_purpose || applicantData.purpose || 'Not specified',
    };

    // Step 4: Call Gemini AI
    const loanProfile = await getLoanProfile(cleanedData, wealthContext, loanRequest);

    // Step 5: Return combined response
    res.json({
      success: true,
      loan_profile: loanProfile,
      wealth_context: {
        wealth_percentile: wealthContext.wealth_percentile,
        relative_wealth_label: wealthContext.relative_wealth_label,
        regional_median_income: wealthContext.regional_median_income,
        sample_size: wealthContext.sample_size,
        using_national_dataset: wealthContext.using_national_dataset,
      },
    });
  } catch (err) {
    console.error('Profile generation error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate loan profile. Please try again.',
    });
  }
});

module.exports = router;
