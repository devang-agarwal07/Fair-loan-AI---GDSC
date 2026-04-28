<p align="center">
  <img src="https://img.shields.io/badge/Google%20Gemini-AI%20Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>

<h1 align="center">🌾 FairLoan AI</h1>
<p align="center"><strong>Community-Relative, AI-Powered Fair Lending for Rural India</strong></p>

<p align="center">
  <a href="https://client-six-orcin-32.vercel.app">🌐 Live Demo</a> •
  <a href="#-problem-statement">📋 Problem</a> •
  <a href="#-solution">💡 Solution</a> •
  <a href="#-how-it-works">⚙️ How It Works</a> •
  <a href="#-tech-stack">🛠 Tech Stack</a> •
  <a href="#-getting-started">🚀 Setup</a> •
  <a href="#-future-roadmap">🔮 Roadmap</a>
</p>

---

## 📋 Problem Statement

> **"A farmer in Vidarbha earning ₹1,50,000/year is NOT the same as a farmer in Punjab earning ₹1,50,000/year — but every bank in India treats them identically."**

India has **120+ million farming households**, yet the agricultural credit system is fundamentally broken:

| The Problem | The Impact |
|---|---|
| 🏦 Banks use **national income benchmarks** | A ₹1.5L income in drought-prone Vidarbha is scored the same as ₹1.5L in irrigated Punjab |
| 📊 One-size-fits-all credit scoring | **40%+ farmers** rely on informal moneylenders charging **36–60% interest** |
| 🚫 Small farmers are rejected outright | They don't meet national collateral or income thresholds |
| 💸 Those who qualify get unfairly high rates | Their wealth is underestimated relative to their community |

### The Debt Trap Cycle

```
  ┌─────────────────────────────────────────────────────┐
  │  Farmer applies to bank                             │
  │         ↓                                           │
  │  Evaluated against NATIONAL benchmarks              │
  │         ↓                                           │
  │  ❌ Rejected (income too low by national standards) │
  │         ↓                                           │
  │  Falls back to moneylender (36-60% interest)        │
  │         ↓                                           │
  │  Debt trap → Reduced savings → Lower credit score   │
  │         ↓                                           │
  │  🔄 Cycle repeats                                   │
  └─────────────────────────────────────────────────────┘
```

**There is no transparent, community-aware system that evaluates a farmer's relative wealth within their local economy.**

---

## 💡 Solution

**FairLoan AI** is a full-stack web platform that uses **Google Gemini AI** and **crowd-sourced community data** to generate fair, personalized loan profiles for rural farmers.

### The Core Idea

```
  Traditional Bank:                    FairLoan AI:
  ┌──────────────────┐                ┌──────────────────────────┐
  │ Farmer Income:   │                │ Farmer Income: ₹1,50,000 │
  │ ₹1,50,000        │                │ Community Median: ₹90,000│
  │                  │                │                          │
  │ National Median: │                │ Percentile: 72nd         │
  │ ₹3,00,000        │                │ Label: "Upper Middle"    │
  │                  │                │                          │
  │ Verdict:         │                │ Verdict:                 │
  │ ❌ REJECTED      │                │ ✅ APPROVED at 7.5%      │
  │ "Below threshold"│                │ "Strong in community"    │
  └──────────────────┘                └──────────────────────────┘
```

### Key Innovation: Community-Relative Wealth Scoring

Instead of comparing farmers against national averages, FairLoan:

1. **Builds a crowd-sourced dataset** of local economic profiles (land, income, assets, loans)
2. **Calculates each farmer's wealth percentile** within their own region
3. **Feeds the percentile to Gemini AI** with a fairness-first prompt
4. **Guarantees progressive rates** — poorer farmers ALWAYS get lower interest rates

---

## ⚙️ How It Works

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Farmer  │  │ Community │  │  Bias    │  │  Explore     │   │
│  │  Form    │  │ Contribute│  │  Audit   │  │  Dataset     │   │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │             │               │            │
└───────┼──────────────┼─────────────┼───────────────┼────────────┘
        │              │             │               │
        ▼              ▼             ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                 │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Data Quality │  │ Wealth       │  │ Bias Filter            │  │
│  │ Guard       │  │ Scorer       │  │ (strips gender, caste) │  │
│  │ (7 checks)  │  │ (percentile) │  │                        │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         │                │                      │               │
│         ▼                ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Google Gemini 2.0 Flash                    │    │
│  │  • Loan Profiling    • Consistency Check (3x)           │    │
│  │  • Document Vision   • Scheme Matching                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                          │
│                    │ Firebase         │                          │
│                    │ Firestore        │                          │
│                    │ (Cloud Database) │                          │
│                    └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Loan Profile Generation Flow

```
Step 1: Farmer submits profile
         ↓
Step 2: Data Quality Guard runs 7 cross-field checks
         ↓  (reject impossible data, e.g., 50 acres + ₹10K income)
Step 3: Wealth Scorer calculates community percentile
         ↓  (e.g., "72nd percentile in Vidarbha region")
Step 4: Bias Filter strips protected attributes
         ↓  (gender, caste, religion removed before AI sees data)
Step 5: Gemini AI generates fair loan profile
         ↓  (interest rate, loan limit, collateral, repayment plan)
Step 6: Result displayed with full transparency
         ↓  (explainability panel, bank comparison, scheme matching)
```

### Data Quality — 7 Cross-Field Checks

| # | Check | Example Caught |
|---|---|---|
| 1 | Large land + absurdly low income | 50 acres but ₹10,000 income |
| 2 | Tiny land + absurdly high income | 0.5 acres but ₹50,00,000 income |
| 3 | Large household + zero expenses | 8 people, ₹200/month expenses |
| 4 | Many loans + zero outstanding | 5 active loans, ₹0 balance |
| 5 | Savings impossibly high vs income | ₹50L savings on ₹80K income |
| 6 | Assets impossibly high vs income/land | ₹1Cr assets on 1 acre + ₹1L income |
| 7 | Rainfed yield exceeding physics | 100 quintals/acre with no irrigation |

> Entries failing these checks are **hard-rejected**. Users can appeal by uploading a government document verified by **Gemini Vision AI**.

---

## 🧮 The Fairness Algorithm

```
Wealth Score = (Land × Regional Land Value) 
             + Annual Income 
             + Savings 
             + Total Assets 
             - (Outstanding Loans × 0.8)

Percentile = (# of community members scoring below) / (total community size) × 100

Interest Rate Mapping (enforced by AI):
  Bottom 20% (poorest)  →  4-7%   (most favorable)
  Lower Middle          →  7-9%
  Middle                →  9-11%
  Upper Middle          →  11-14%
  Top 20% (wealthiest)  →  14-18% (standard market rate)
```

**Key fairness guarantee:** The algorithm is **monotonically progressive** — verified through the public Bias Audit dashboard that checks every quintile.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **AI Loan Profiling** | Personalized interest rate, loan limit, collateral & repayment from Gemini AI |
| 📊 **Community Wealth Scoring** | Percentile-based ranking within local economy, not national benchmarks |
| 🛡️ **7-Layer Data Validation** | Cross-field consistency + IQR statistical outlier detection |
| 📄 **Document Appeal** | Gemini Vision verifies government documents for rejected applicants |
| ❓ **Explainability Panel** | "Why did you get this rate?" — step-by-step breakdown |
| 🏦 **Bank Comparison** | Side-by-side traditional bank vs FairLoan with ₹ savings calculation |
| 🏛️ **Scheme Matcher** | AI-powered government welfare scheme recommendations |
| 📈 **Bias Audit Dashboard** | Public quintile analysis proving the algorithm is progressive |
| 🔁 **Consistency Check** | Triple Gemini call to ensure rate stability (±2% tolerance) |
| 🌐 **Crowd-Sourced Data** | Community contributes anonymized economic profiles |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite + TailwindCSS | Responsive SPA with dark mode |
| **Backend** | Node.js + Express | RESTful API with rate limiting |
| **AI Engine** | Google Gemini 2.0 Flash | Loan profiling, vision verification, scheme matching |
| **Database** | Firebase Firestore | Cloud-native NoSQL with real-time sync |
| **Deployment** | Vercel (frontend) + Render (backend) | Auto-scaling, zero-config hosting |
| **Security** | LRU caching, rate limiting, input sanitization | API quota protection + data integrity |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API Key ([get one here](https://aistudio.google.com/apikey))
- Firebase project with Firestore enabled

### Installation

```bash
# Clone the repo
git clone https://github.com/devang-agarwal07/Fair-loan-AI---GDSC.git
cd Fair-loan-AI---GDSC

# Install backend dependencies
cd server
npm install

# Create .env file (copy from .env.example and fill in your keys)
cp .env.example .env

# Seed the database
node scripts/importToFirebase.js

# Start the backend
npm run dev

# In a new terminal — install and start frontend
cd ../client
npm install
npm run dev
```

### Environment Variables

```env
# server/.env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 📊 Impact

| Scenario | Traditional Bank | FairLoan AI | Savings |
|---|---|---|---|
| Vidarbha farmer, ₹1.5L income, 3 acres | ❌ Rejected or 13.9% | ✅ Approved at ~8% | **₹5,900/year** per ₹1L |
| Bihar farmer, ₹35K income, 0.8 acres | ❌ Rejected | ✅ Approved at ~5.5% | **Access unlocked** |
| Punjab farmer, ₹8.5L income, 15 acres | ✅ 10.5% (KCC) | ✅ 14% (wealthy in community) | **Fairer cross-subsidy** |

> The wealthy pay more. The poor pay less. Geography doesn't determine destiny.

---

## 🔮 Future Roadmap

The current prototype is purpose-built for **agricultural lending in rural India** — but the core concept of **community-relative AI scoring** is sector-agnostic. The same principle — *"judge a person's capability relative to their local context, not a national average"* — can eliminate systemic bias across multiple domains.

### Planned Sector Expansions

| Sector | Problem Today | FairLoan Approach |
|---|---|---|
| 🛒 **Microfinance for Street Vendors** | India's 93% informal workforce is rejected by banks for lack of formal income proof | Score vendors against others in their market cluster, not salaried professionals |
| 🎓 **Education Loans** | First-generation learners from rural families are denied loans despite strong community standing | Recognize that ₹2L/year in rural Bihar is upper-middle locally — making them viable borrowers |
| 🏥 **Healthcare Financing** | Medical loans priced on national risk tables penalize underserved regions | Community-aware health financing based on local indicators |
| 👩‍💼 **Women Entrepreneur Lending** | Women SHGs have 97% repayment rates yet face higher interest | Bias-filtering strips gender before AI processing for truly blind decisions |
| 🏠 **Affordable Housing** | Tier-2/3 city applicants evaluated against metro benchmarks | Regional wealth-relative scoring unlocks fair home loans |

### Platform Vision

```
  Today:                              Future:
  ┌──────────────────┐                ┌──────────────────────────┐
  │  FairLoan AI     │                │  Fairness-as-a-Service   │
  │  (Farming Only)  │     ──────►    │  (Open-Source Framework) │
  │                  │                │                          │
  │  1 sector        │                │  • Any lending sector    │
  │  1 country       │                │  • Any country           │
  │  Prototype MVP   │                │  • Plug-in API for banks │
  └──────────────────┘                │  • Public audit tools    │
                                      │  • Regional data layers  │
                                      └──────────────────────────┘
```

We envision FairLoan evolving into an **open-source Fairness-as-a-Service (FaaS) framework** that any lending institution, NGO, or government body can integrate — providing community data crowdsourcing, bias detection, algorithmic auditing, and explainable AI decisions.

**The mission remains the same: AI should level the playing field, not reinforce existing inequalities.**

---

## 🏗 Project Structure

```
fairloan/
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── FarmerForm.jsx          # Multi-step loan application
│   │   │   ├── LoanProfileCard.jsx     # AI-generated loan display
│   │   │   ├── WealthMeter.jsx         # Community percentile gauge
│   │   │   ├── ComparisonChart.jsx     # Rate comparison bar chart
│   │   │   ├── TraditionalComparison.jsx # Bank vs FairLoan panel
│   │   │   ├── DataQualityAppeal.jsx   # Document upload for appeals
│   │   │   └── FairnessExplainer.jsx   # Explainability panel
│   │   └── pages/             # Route pages
│   │       ├── Home.jsx                # Landing page
│   │       ├── GetLoanProfile.jsx      # Main loan application flow
│   │       ├── ContributeData.jsx      # Community data submission
│   │       ├── ExploreDataset.jsx      # Dataset explorer
│   │       ├── BiasAudit.jsx           # Public audit dashboard
│   │       └── BiasSimulator.jsx       # What-if bias testing
│   └── .env.production        # Production API URL
│
├── server/                    # Node.js + Express Backend
│   ├── routes/
│   │   ├── profile.js         # POST /api/profile (AI loan generation)
│   │   ├── dataset.js         # GET/POST /api/dataset (CRUD)
│   │   ├── appeal.js          # POST /api/dataset/appeal (document verify)
│   │   ├── audit.js           # GET /api/audit (bias analysis)
│   │   ├── consistency.js     # POST /api/consistency-check (3x verify)
│   │   └── schemes.js         # POST /api/schemes (govt scheme matcher)
│   ├── utils/
│   │   ├── geminiClient.js    # Gemini AI with LRU cache + 3-model fallback
│   │   ├── wealthScorer.js    # Community-relative percentile scoring
│   │   ├── dataQualityGuard.js # 7 cross-field checks + IQR outlier detection
│   │   ├── biasFilter.js      # Strips protected attributes before AI
│   │   ├── firebaseDB.js      # Firestore abstraction layer
│   │   ├── documentVerifier.js # Gemini Vision document verification
│   │   ├── datasetAnalyzer.js  # Dataset health analysis
│   │   └── fairnessMetrics.js  # Quintile fairness verification
│   ├── data/
│   │   └── community_dataset.json  # Seed data (legacy backup)
│   └── scripts/
│       └── importToFirebase.js     # One-time Firestore seeder
│
├── .gitignore                 # Excludes .env, Firebase keys, node_modules
└── README.md                  # You are here!
```

---

## 👥 Team

Built for **Google Developer Solution Challenge (GDSC) Hackathon 2026**

---

<p align="center">
  <strong>🌾 FairLoan AI — Because your ZIP code shouldn't determine your interest rate.</strong>
</p>
