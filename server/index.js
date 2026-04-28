require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const profileRoutes = require('./routes/profile');
const datasetRoutes = require('./routes/dataset');
const auditRoutes = require('./routes/audit');
const consistencyRoutes = require('./routes/consistency');
const appealRoutes = require('./routes/appeal');
const schemesRoutes = require('./routes/schemes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS: Restrict origins in production, allow all in development ---
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null; // null = allow all in dev

app.use(cors({
  origin: ALLOWED_ORIGINS || true, // true = allow all origins (dev mode)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// --- Rate Limiting: Protect against API abuse ---

// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please wait 15 minutes and try again.' },
});

// Stricter limit for AI-dependent routes: 10 requests per 15 minutes per IP
// (These consume Gemini API quota which is expensive and limited)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Each profile/consistency check uses API quota. Please wait 15 minutes.' },
});

// Moderate limit for dataset writes: 20 submissions per 15 minutes per IP
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission limit reached. Please wait before contributing more data.' },
});

app.use(express.json({ limit: '10mb' }));

// Apply general rate limit to all routes
app.use('/api/', generalLimiter);

// Routes with specific rate limits
app.use('/api/profile', aiLimiter, profileRoutes);           // AI-dependent
app.use('/api/consistency-check', aiLimiter, consistencyRoutes); // AI-dependent
app.use('/api/dataset', datasetRoutes);                      // Write limiter applied per-route below
app.use('/api/dataset/appeal', aiLimiter, appealRoutes);     // AI-dependent (Gemini Vision)
app.use('/api/audit', auditRoutes);
app.use('/api/schemes', aiLimiter, schemesRoutes);   // AI-dependent (Gemini)

// Apply write limiter specifically to POST /api/dataset
app.post('/api/dataset', writeLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`FairLoan AI server running on port ${PORT}`);
  if (ALLOWED_ORIGINS) {
    console.log(`CORS restricted to: ${ALLOWED_ORIGINS.join(', ')}`);
  } else {
    console.log('CORS: allowing all origins (development mode)');
  }
  console.log('Rate limiting: enabled (100 general / 10 AI / 20 write per 15min)');
});
