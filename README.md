# 🌾 FairLoan AI — Fair Agricultural Lending

**FairLoan AI** is an unbiased, crowd-sourced agricultural loan profiling system that uses AI to determine fair interest rates, collateral requirements, and loan limits based on a farmer's relative wealth within their local economic context. A wealthy landowner pays higher interest; a subsistence farmer pays lower. The AI removes geographic and social bias and evaluates each person fairly relative to their community, not on absolute national standards.

---

## 🧠 The "Inverse Wealth Scoring" Philosophy

Traditional lending penalises poverty: banks use rigid national criteria that systematically exclude small farmers, pushing them to moneylenders charging 24–36%.

**FairLoan AI inverts this:**

1. We collect anonymous economic profiles from farming communities
2. We calculate where each applicant sits on their **local** wealth spectrum (percentile)
3. A farmer at the **10th percentile** in their village gets the **lowest** interest rate (as low as 4%)
4. A farmer at the **90th percentile** gets **standard** rates (up to 18%)
5. Your region's poverty doesn't penalise you — only your **relative position** within your own community matters

This is **economic justice**: those who can afford to pay more, do. Those who can't, get the support they need.

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ installed
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd fairloan
```

### 2. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### 3. Set up environment variables

```bash
# In the server directory
cp server/.env.example server/.env
```

Edit `server/.env` and paste your Gemini API key:
```
GEMINI_API_KEY=your_actual_key_here
```

### 4. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 5. Run locally

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

### 6. Seed Data

The dataset comes pre-seeded with **20 realistic entries** across four Indian agricultural regions:
- Vidarbha, Maharashtra (cotton farmers, poor to middle)
- Punjab (wheat farmers, middle to wealthy)
- Bihar (subsistence farmers, poor)
- Andhra Pradesh (mixed crops, full range)

No additional seeding is required.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend | Node.js + Express |
| AI | Google Gemini 2.0 Flash (with multi-model fallback) |
| Data | JSON flat-file (swap-ready for MongoDB/PostgreSQL) |
| Charts | Recharts |
| CSV | PapaParse |
| PDF | jsPDF |

---

## 🌍 Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy the `dist` folder to Vercel
```

Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Backend → Railway

1. Push your `server` folder to a Git repo
2. Connect to [Railway](https://railway.app)
3. Set environment variables:
   - `GEMINI_API_KEY`
   - `PORT=3001`
   - `DATA_FILE_PATH=./data/community_dataset.json`

---

## 🔍 Bias Detection & Fairness Auditing

FairLoan AI doesn't just make fair decisions — it **proves** fairness with mathematical metrics.

### Bias Audit Dashboard (`/bias-audit`)
- **Dataset Health Check**: Monitors sample sizes, regional representation, income distribution skew
- **Demographic Parity**: Checks if average rates are equal across regions, income brackets, ownership types
- **Disparate Impact (80% Rule)**: Legal threshold test — ensures no group gets favorable rates less than 80% as often as the best group
- **Outlier Detection**: Flags entries that deviate >2 standard deviations from the mean
- **Upload Any Dataset**: Bring your own lending data (CSV) to audit for bias

### "What-If" Bias Simulator (`/simulator`)
- Establish a baseline farmer profile
- Modify one variable (region, income, land size) and compare results
- Proves the system doesn't discriminate based on geography alone
- Visual comparison history chart

### Algorithm Fairness Verification
- Quintile analysis: splits all farmers into 5 wealth groups
- Verifies poorest 20% always get the lowest rates
- Confirms rate progression is monotonic (4.9% → 16.3% spread)

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audit` | POST | Run full bias report on any dataset |
| `/api/audit/health` | GET | Dataset health & representation analysis |
| `/api/audit/fairness` | GET | Algorithm fairness verification |
| `/api/consistency-check` | POST | Run AI 3x and check consistency |

---

## 🗺️ Future Roadmap

- **Education Loans** — Extend the fairness model to student loans for rural families
- **Job Credit Scoring** — Fair credit based on employment context, not just salary
- **Health Financing** — Fair medical loan terms based on community health economics
- **Multi-language UI** — Hindi, Marathi, Tamil, Telugu, Punjabi
- **Offline mode** — PWA support for areas with limited connectivity
- **Government scheme integration** — Match farmers with eligible subsidies
- **Cooperative lending** — Allow farmer groups to co-guarantee loans

---

## 📄 License

MIT License — Open source, free to use and modify.

---

Built with ❤️ for India's farmers.
