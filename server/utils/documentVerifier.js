/**
 * Document Verifier — Uses Gemini Vision API to analyze uploaded government
 * documents and cross-reference them against rejected form data.
 *
 * Flow:
 * 1. Read uploaded file as base64
 * 2. Send to Gemini Vision with verification prompt
 * 3. Parse response — approve or reject with reasons
 * 4. Delete file immediately after analysis (no PII retention)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// DOCUMENT HASH CACHE — avoids re-verifying identical documents
// ============================================================
const DOC_CACHE = new Map();
const DOC_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const DOC_CACHE_MAX = 100;

function getDocHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function getFromDocCache(hash) {
  const entry = DOC_CACHE.get(hash);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DOC_CACHE_TTL_MS) {
    DOC_CACHE.delete(hash);
    return null;
  }
  return entry.result;
}

function setInDocCache(hash, result) {
  if (DOC_CACHE.size >= DOC_CACHE_MAX) {
    const oldestKey = DOC_CACHE.keys().next().value;
    DOC_CACHE.delete(oldestKey);
  }
  DOC_CACHE.set(hash, { result, timestamp: Date.now() });
}

/**
 * Map file extensions to MIME types Gemini accepts.
 */
const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

/**
 * Build the verification prompt for Gemini Vision.
 */
function buildVerificationPrompt(formData, rejectionReasons) {
  return `You are a document verification assistant for FairLoan AI, an agricultural lending platform in India.

A farmer submitted the following data on our platform, but it was flagged by our automated quality checks:

SUBMITTED FORM DATA:
- Region: ${formData.region || 'Not specified'}
- Land Size: ${formData.land_size_acres || 0} acres
- Annual Income: ₹${(formData.annual_income_inr || 0).toLocaleString()}
- Land Ownership: ${formData.land_ownership || 'Not specified'}
- Household Size: ${formData.household_size || 'Not specified'}
- Monthly Expenses: ₹${(formData.monthly_expenses_inr || 0).toLocaleString()}
- Existing Loans: ${formData.existing_loans?.count || 0} (Outstanding: ₹${(formData.existing_loans?.total_outstanding_inr || 0).toLocaleString()})

REJECTION REASONS:
${rejectionReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

The farmer has uploaded the attached document as proof to support their submission.

YOUR TASK — Analyze the document and provide:

1. DOCUMENT TYPE: Identify the document type. Accepted document types include:
   - Land Revenue Record / Khasra-Khatauni, 7/12 Extract, RoR
   - Bank Statement, Income Certificate, Patwari Certificate
   - MGNREGA Job Card
   - PM-Kisan Beneficiary Certificate
   - Kisan Credit Card (KCC)
   - Village Panchayat Certificate
   - Aadhaar Card (for region/address confirmation ONLY — Aadhaar confirms region and household; accept it for address/region verification only, not income or land)

2. DATA EXTRACTION: Read and extract these fields from the document:
   - Location/District/State mentioned
   - Land area mentioned (convert to acres if in hectares/bigha)
   - Any income or financial figures
   - Date of issue

3. CROSS-REFERENCE: Compare extracted data with the form data above. Does the document support or contradict the farmer's submission? Pay special attention to the fields mentioned in the rejection reasons.

4. AUTHENTICITY ASSESSMENT: Check for these red flags:
   - Does the document follow standard Indian government document formatting?
   - Are fonts, text sizes, and alignment consistent? (Mixed fonts suggest editing)
   - Are official stamps, seals, or letterheads present where expected?
   - Does text appear naturally printed or digitally pasted over?
   - Are dates logical and consistent?
   - Is there visible pixelation, blurring, or artifacts around key text/numbers?
   - Does the document resolution and quality look consistent throughout?

RESPOND IN EXACTLY THIS JSON FORMAT (no extra text, no markdown fences):
{
  "document_type": "string — the identified document type",
  "is_recognized_format": true or false,
  "extracted_data": {
    "region": "string or null",
    "land_acres": number or null,
    "income": number or null,
    "date_of_issue": "string or null"
  },
  "consistency": {
    "matches_form": true or false,
    "details": "string explaining what matches and what doesn't"
  },
  "authenticity": {
    "score": number 1-10 (10 = very likely authentic, 1 = clearly fake),
    "flags": ["list of specific concerns, empty array if none"]
  },
  "verdict": "APPROVED" or "REJECTED",
  "verdict_reason": "Clear, one-sentence explanation of the decision"
}`;
}

/**
 * Analyze an uploaded document using Gemini Vision.
 *
 * @param {string} filePath — Absolute path to the uploaded file
 * @param {Object} formData — The original form data that was rejected
 * @param {string[]} rejectionReasons — Why the form data was rejected
 * @returns {Object} — Verification result with verdict
 */
async function verifyDocument(filePath, formData, rejectionReasons) {
  try {
    // Read file and determine MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_MAP[ext];

    if (!mimeType) {
      return {
        verdict: 'REJECTED',
        verdict_reason: `Unsupported file format: ${ext}. Please upload JPG, PNG, or PDF.`,
        authenticity: { score: 0, flags: ['Unsupported format'] },
      };
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Check document hash cache before calling Gemini Vision
    const docHash = getDocHash(fileBuffer);
    const cachedVerdict = getFromDocCache(docHash);
    if (cachedVerdict) {
      console.log('Document cache hit — returning cached verification result');
      return { ...cachedVerdict, _cached: true };
    }

    const base64Data = fileBuffer.toString('base64');

    // Call Gemini Vision
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = buildVerificationPrompt(formData, rejectionReasons);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text();

    // Parse the JSON response
    let verification;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      verification = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error('Failed to parse Gemini verification response:', parseErr.message);
      console.error('Raw response:', responseText.substring(0, 500));
      return {
        verdict: 'REJECTED',
        verdict_reason: 'Our AI could not process this document. Please upload a clearer image or PDF.',
        authenticity: { score: 0, flags: ['AI parsing failed'] },
        raw_response: responseText.substring(0, 300),
      };
    }

    // Validate critical fields exist
    if (!verification.verdict || !['APPROVED', 'REJECTED'].includes(verification.verdict)) {
      verification.verdict = 'REJECTED';
      verification.verdict_reason = verification.verdict_reason || 'Document could not be conclusively verified.';
    }

    // Ensure authenticity score is reasonable
    if (verification.authenticity?.score && verification.authenticity.score < 5) {
      verification.verdict = 'REJECTED';
      verification.verdict_reason = verification.verdict_reason || 'Document authenticity score too low.';
    }

    // Ensure consistency match is considered
    if (verification.consistency?.matches_form === false && verification.verdict === 'APPROVED') {
      // If data doesn't match but AI said approved, override to rejected
      verification.verdict = 'REJECTED';
      verification.verdict_reason = 'Document data does not match the values you submitted.';
    }

    // Cache the verification result
    setInDocCache(docHash, verification);

    return verification;
  } catch (err) {
    console.error('Document verification error:', err.message);

    // Handle specific API errors
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      return {
        verdict: 'REJECTED',
        verdict_reason: 'Verification service is temporarily busy. Please try again in a few minutes.',
        authenticity: { score: 0, flags: ['API rate limit'] },
      };
    }

    return {
      verdict: 'REJECTED',
      verdict_reason: 'An error occurred during verification. Please try again or upload a different document.',
      authenticity: { score: 0, flags: [`Error: ${err.message}`] },
    };
  } finally {
    // ALWAYS delete the uploaded file — no PII retention
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (delErr) {
      console.error('Failed to delete uploaded file:', delErr.message);
    }
  }
}

module.exports = { verifyDocument };
