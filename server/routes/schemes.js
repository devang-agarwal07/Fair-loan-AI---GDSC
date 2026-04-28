const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const { filterBias } = require('../utils/biasFilter');

// ============================================================
// SCHEME CACHE — avoids redundant Gemini calls for same profile
// ============================================================
const SCHEME_CACHE = new Map();
const SCHEME_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const SCHEME_CACHE_MAX = 200;

function getSchemeCacheKey(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function getFromSchemeCache(key) {
  const entry = SCHEME_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > SCHEME_CACHE_TTL_MS) {
    SCHEME_CACHE.delete(key);
    return null;
  }
  return entry.result;
}

function setInSchemeCache(key, result) {
  if (SCHEME_CACHE.size >= SCHEME_CACHE_MAX) {
    const oldestKey = SCHEME_CACHE.keys().next().value;
    SCHEME_CACHE.delete(oldestKey);
  }
  SCHEME_CACHE.set(key, { result, timestamp: Date.now() });
}

/**
 * POST /api/schemes
 * Receives farmer profile data and returns 3 matching government schemes.
 */
router.post('/', async (req, res) => {
  try {
    const applicantData = req.body;
    if (!applicantData.region) {
      return res.status(400).json({ error: 'Region is required' });
    }

    const cleanedData = filterBias(applicantData);

    // Check cache first
    const cacheKey = getSchemeCacheKey(cleanedData);
    const cached = getFromSchemeCache(cacheKey);
    if (cached) {
      console.log('Scheme cache hit — returning cached result');
      return res.json({ success: true, schemes: cached, cached: true });
    }

    // Build compact prompt to save quota
    const profileSummary = {
      region: cleanedData.region,
      land_acres: cleanedData.land_size_acres,
      land_ownership: cleanedData.land_ownership,
      crops: cleanedData.crop_types,
      annual_income: cleanedData.annual_income_inr,
      household_size: cleanedData.household_size,
      irrigation: cleanedData.irrigation_access,
      existing_loans: cleanedData.existing_loans?.count || 0,
      past_defaults: cleanedData.past_defaults,
    };

    const prompt = `You are an Indian agricultural welfare expert. Given this farmer profile: ${JSON.stringify(profileSummary)}, list exactly 3 government schemes they are most likely eligible for. For each scheme provide: name, one-line description, eligibility reason, and application URL. Respond only in JSON array format:
[{"name":"...","description":"...","eligibility_reason":"...","application_url":"..."}]`;

    // Call Gemini 2.0 Flash
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Strip markdown fences if present
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let schemes;
    try {
      schemes = JSON.parse(text);
      if (!Array.isArray(schemes)) throw new Error('Response is not an array');
    } catch (parseErr) {
      console.error('Scheme parsing error:', parseErr.message);
      console.error('Raw text:', text.substring(0, 500));
      return res.status(500).json({ error: 'Failed to parse scheme recommendations' });
    }

    // Cache the result
    setInSchemeCache(cacheKey, schemes);

    res.json({ success: true, schemes });
  } catch (err) {
    console.error('Scheme matcher error:', err.message);

    if (err.message?.includes('429') || err.message?.includes('quota')) {
      return res.status(429).json({ error: 'AI quota limit reached. Please try again in a few minutes.' });
    }

    res.status(500).json({ error: err.message || 'Failed to find matching schemes' });
  }
});

module.exports = router;
