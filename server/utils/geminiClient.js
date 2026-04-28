const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

// ============================================================
// LRU CACHE — avoids redundant Gemini calls for identical inputs
// ============================================================
const PROFILE_CACHE = new Map();
const CACHE_MAX_SIZE = 200;
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getCacheKey(cleanedData, wealthContext, loanRequest) {
  const payload = JSON.stringify({ cleanedData, wealthContext, loanRequest });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function getFromCache(key) {
  const entry = PROFILE_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    PROFILE_CACHE.delete(key);
    return null;
  }
  return entry.result;
}

function setInCache(key, result) {
  // Evict oldest entry if at capacity
  if (PROFILE_CACHE.size >= CACHE_MAX_SIZE) {
    const oldestKey = PROFILE_CACHE.keys().next().value;
    PROFILE_CACHE.delete(oldestKey);
  }
  PROFILE_CACHE.set(key, { result, timestamp: Date.now() });
}

let genAI = null;

function getGenAI() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Build the fairness-focused prompt for Gemini.
 */
function buildPrompt(cleanedData, wealthContext, loanRequest) {
  const totalAssetValue = wealthContext.total_asset_value || 0;

  return `You are an expert agricultural loan officer providing FAIR, UNBIASED loan assessments. Loan terms must reflect ability to repay relative to LOCAL community, not national averages.

Here is the applicant's profile (all identifying information has been removed):

LOAN REQUEST
- Amount requested: ₹${loanRequest.loan_amount || 0}
- Purpose: ${loanRequest.purpose || 'Not specified'}

INDIVIDUAL PROFILE
- Region type: ${cleanedData.region || 'Unknown'}
- Land: ${cleanedData.land_size_acres || 0} acres (${cleanedData.land_ownership || 'unknown'})
- Crops: ${(cleanedData.crop_types || []).join(', ') || 'Not specified'}
- Annual income: ₹${cleanedData.annual_income_inr || 0} (${cleanedData.income_regularity || 'unknown'})
- Off-season income: ₹${cleanedData.off_season_income || 0}
- Monthly expenses: ₹${cleanedData.monthly_expenses_inr || 0}
- Household size: ${cleanedData.household_size || 0}
- Total savings: ₹${cleanedData.total_savings_inr || 0}
- Assets total value: ₹${totalAssetValue}
- Existing loan burden: ₹${cleanedData.existing_loans?.total_outstanding_inr || 0} across ${cleanedData.existing_loans?.count || 0} loans
- Past defaults: ${cleanedData.past_defaults ? 'Yes' : 'No'}
- Avg yield: ${cleanedData.average_yield_quintals_per_acre || 0} quintals/acre
- Irrigation access: ${cleanedData.irrigation_access ? 'Yes' : 'No'}
- Market distance: ${cleanedData.market_distance_km || 0} km

COMMUNITY CONTEXT (KEY — use this to calibrate fairness)
- Wealth percentile within local region: ${wealthContext.wealth_percentile}th percentile
- Relative standing: ${wealthContext.relative_wealth_label}
- Regional median annual income: ₹${wealthContext.regional_median_income}
- Community sample size used: ${wealthContext.sample_size} farmers
${wealthContext.using_national_dataset ? '- NOTE: Insufficient local data — using national dataset for comparison' : ''}

FLAGS
- High moneylender dependency: ${cleanedData.moneylender_flag ? 'Yes' : 'No'}
- Rural remoteness: ${cleanedData.remoteness_flag ? 'Yes' : 'No'}

INSTRUCTIONS
1. A farmer at the 10th wealth percentile should receive the LOWEST interest rates and MINIMAL collateral requirements — they are the most vulnerable and have the least ability to absorb financial shock.
2. A farmer at the 90th wealth percentile should receive standard-to-high interest rates and standard collateral requirements — they have greater capacity to bear the cost of capital.
3. Seasonal income must be factored into repayment scheduling recommendations.
4. Do NOT penalise a farmer for being in a poor region — only their relative position within that region matters.
5. Rural remoteness and moneylender dependency are structural disadvantages, not personal failures — treat them as grounds for more favourable terms, not risk flags.

Respond in this exact JSON format (no markdown, no extra text, no code fences):
{
  "interest_rate_annual_percent": <number between 4.0 and 18.0, rounded to 1 decimal>,
  "interest_rate_label": "<Very Low | Low | Moderate | Standard | High>",
  "collateral_requirement": "<None | Crop pledge only | Equipment pledge | Land title required | Full collateral>",
  "collateral_explanation": "<plain English, 1-2 sentences>",
  "loan_limit_inr": <number>,
  "loan_limit_reasoning": "<plain English, 1-2 sentences>",
  "repayment_schedule": "<Monthly | Quarterly | Post-harvest lump sum | Bi-annual>",
  "repayment_reasoning": "<plain English, why this schedule suits their income pattern>",
  "fairness_score": <number 1-10, where 10 = most favourable terms, given to poorest applicants>,
  "fairness_explanation": "<plain English, 2-3 sentences explaining WHY these terms are fair for this person>",
  "risk_rating": "<Very Low | Low | Moderate | High | Very High>",
  "risk_factors": ["<up to 4 risk factors>"],
  "positive_factors": ["<up to 4 things working in their favour>"],
  "recommendations": [
    {
      "title": "<short action title>",
      "description": "<1-2 sentence plain English advice>",
      "priority": "<Urgent | Suggested | Optional>"
    }
  ],
  "wealth_context_note": "<1-2 sentences explaining how their community ranking affected these terms>"
}`;
}

/**
 * Safe fallback profile returned when Gemini's response cannot be parsed.
 * Uses conservative defaults so the frontend never crashes.
 */
const FALLBACK_PROFILE = {
  interest_rate_annual_percent: 12.0,
  interest_rate_label: 'Standard',
  collateral_requirement: 'Manual review required',
  collateral_explanation: 'The AI system could not process this profile. A human loan officer should review this application.',
  loan_limit_inr: 0,
  loan_limit_reasoning: 'Could not be determined due to a processing error.',
  repayment_schedule: 'Monthly',
  repayment_reasoning: 'Default schedule assigned — please consult a loan officer for a tailored plan.',
  fairness_score: 5,
  fairness_explanation: 'The AI encountered an error while analyzing this profile. The terms shown are conservative defaults, not a personalized assessment. Please try again.',
  risk_rating: 'Moderate',
  risk_factors: ['AI processing error — profile could not be fully analyzed'],
  positive_factors: [],
  recommendations: [
    {
      title: 'Retry Your Assessment',
      description: 'This result was generated due to an AI error. Please submit your profile again for an accurate, personalized assessment.',
      priority: 'Urgent',
    },
  ],
  wealth_context_note: 'Community context could not be applied due to a processing error.',
  _is_fallback: true,
};

/**
 * Validate that a parsed Gemini response has all required fields.
 * Returns true if the response is usable, false if critical fields are missing.
 */
function isValidProfile(parsed) {
  return (
    typeof parsed.interest_rate_annual_percent === 'number' &&
    typeof parsed.fairness_score === 'number' &&
    typeof parsed.interest_rate_label === 'string' &&
    typeof parsed.collateral_requirement === 'string' &&
    typeof parsed.fairness_explanation === 'string'
  );
}

/**
 * Call Gemini 2.0 Flash and parse the JSON response.
 * Includes retry logic with exponential backoff for rate limits.
 * If all attempts fail, returns a safe fallback profile instead of crashing.
 */
async function getLoanProfile(cleanedData, wealthContext, loanRequest) {
  // Check cache first
  const cacheKey = getCacheKey(cleanedData, wealthContext, loanRequest);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('Cache hit for loan profile — returning cached result');
    return { ...cached, _cached: true };
  }

  const ai = getGenAI();
  const prompt = buildPrompt(cleanedData, wealthContext, loanRequest);

  // Try multiple models in order of preference
  const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
  const MAX_RETRIES = 1;

  for (const modelName of MODELS) {
    const model = ai.getGenerativeModel({ model: modelName });
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retry ${attempt}/${MAX_RETRIES} on ${modelName} after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`Calling model: ${modelName} (attempt ${attempt + 1})`);
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // Strip any markdown code fences if present
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (parseErr) {
          console.error(`JSON parse error on ${modelName} (attempt ${attempt + 1}):`, parseErr.message);
          console.error('Raw Gemini text:', text.substring(0, 500));
          // If we still have retries left, try again — Gemini may return valid JSON next time
          if (attempt < MAX_RETRIES) continue;
          // If all retries exhausted for this model, try next model
          break;
        }

        // Validate that the parsed response has all critical fields
        if (!isValidProfile(parsed)) {
          console.error(`Gemini returned JSON but missing required fields on ${modelName}. Keys found:`, Object.keys(parsed));
          if (attempt < MAX_RETRIES) continue;
          break;
        }

        // Clamp interest rate to valid range
        parsed.interest_rate_annual_percent = Math.max(
          4.0,
          Math.min(18.0, parsed.interest_rate_annual_percent)
        );

        // Cache successful result
        setInCache(cacheKey, parsed);
        return parsed;
      } catch (err) {
        lastError = err;
        // On rate limit (429) or model not found (404), try next model
        if (err.status === 429 || err.status === 404) {
          console.log(`Model ${modelName} failed with ${err.status}, trying next...`);
          break; // break inner retry loop, try next model
        }
        // For other errors, retry
        if (attempt < MAX_RETRIES) continue;
      }
    }
  }

  // All models and retries exhausted — return safe fallback instead of crashing
  console.error('All Gemini models exhausted. Returning fallback profile.');
  return { ...FALLBACK_PROFILE };
}

module.exports = { getLoanProfile };
