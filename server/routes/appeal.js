/**
 * Appeal Route — Handles document upload verification for rejected data entries.
 *
 * When a user's data submission fails quality checks (422), they can upload a
 * government document as proof. This route:
 * 1. Receives the file + original form data + rejection reasons
 * 2. Sends the document to Gemini Vision for verification
 * 3. If approved → saves the data entry to the dataset
 * 4. If rejected → returns specific reasons why
 * 5. ALWAYS deletes the uploaded file (no PII retention)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { verifyDocument } = require('../utils/documentVerifier');
const { loadDataset, saveEntry } = require('../utils/firebaseDB');

// --- File Upload Configuration ---
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Use UUID to prevent filename collisions
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `appeal_${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Please upload JPG, PNG, or PDF.`));
    }
  },
});

// --- The Appeal Endpoint ---

/**
 * POST /api/dataset/appeal
 *
 * Body (multipart/form-data):
 *   - document: The uploaded file (JPG/PNG/PDF)
 *   - formData: JSON string of the original rejected form data
 *   - rejectionReasons: JSON string array of why it was rejected
 */
router.post('/', upload.single('document'), async (req, res) => {
  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No document uploaded',
        hint: 'Please upload a government document (JPG, PNG, or PDF) as proof.',
      });
    }

    // Parse the form data and rejection reasons from the request
    let formData, rejectionReasons;
    try {
      formData = JSON.parse(req.body.formData || '{}');
      rejectionReasons = JSON.parse(req.body.rejectionReasons || '[]');
    } catch {
      // Clean up file before returning error
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Invalid request data',
        hint: 'Form data and rejection reasons must be valid JSON.',
      });
    }

    if (!formData.region || !formData.land_size_acres) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Original form data is incomplete',
        hint: 'Region and land size are required.',
      });
    }

    // --- Run Gemini Vision verification ---
    console.log(`[Appeal] Verifying document: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);

    const verification = await verifyDocument(
      req.file.path,
      formData,
      rejectionReasons
    );

    console.log(`[Appeal] Verdict: ${verification.verdict} — ${verification.verdict_reason}`);

    // --- Handle the verdict ---
    if (verification.verdict === 'APPROVED') {
      // Save the entry to the dataset with a verification flag
      const entry = {
        ...formData,
        id: formData.id || uuidv4(),
        submitted_at: new Date().toISOString(),
        _verified_by_document: true,
        _document_type: verification.document_type || 'unknown',
        _verification_date: new Date().toISOString(),
      };

      const saved = await saveEntry(entry);

      // Get current dataset size for response
      const dataset = await loadDataset();

      return res.json({
        success: true,
        verdict: 'APPROVED',
        message: 'Your document has been verified! Your data has been added to the community dataset.',
        verification_details: {
          document_type: verification.document_type,
          authenticity_score: verification.authenticity?.score,
          consistency: verification.consistency?.details,
        },
        dataset_size: dataset.length,
      });
    } else {
      // REJECTED — return detailed reasons
      return res.status(422).json({
        success: false,
        verdict: 'REJECTED',
        message: 'Document verification failed. Your data was not added.',
        verdict_reason: verification.verdict_reason,
        details: {
          document_type: verification.document_type || 'Could not identify',
          authenticity_score: verification.authenticity?.score || 0,
          authenticity_flags: verification.authenticity?.flags || [],
          consistency: verification.consistency?.details || 'Could not verify',
        },
        hint: 'Please upload a clearer, unedited government document, or correct your form data and resubmit.',
      });
    }
  } catch (err) {
    console.error('[Appeal] Error:', err.message);

    // Clean up file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch { }
    }

    res.status(500).json({
      error: 'Document verification failed due to a server error.',
      hint: 'Please try again in a few minutes.',
    });
  }
});

// Handle multer errors (file too large, wrong type)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        hint: 'Maximum file size is 10MB. Please upload a smaller file.',
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message?.includes('not supported')) {
    return res.status(400).json({
      error: err.message,
      hint: 'Supported formats: JPG, PNG, PDF',
    });
  }
  next(err);
});

module.exports = router;
