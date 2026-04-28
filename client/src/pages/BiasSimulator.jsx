import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || '';

const REGIONS = [
  'Vidarbha, Maharashtra', 'Ludhiana, Punjab', 'Amritsar, Punjab', 'Bathinda, Punjab',
  'Madhubani, Bihar', 'Gaya, Bihar', 'Guntur, Andhra Pradesh', 'Kurnool, Andhra Pradesh',
  'East Godavari, Andhra Pradesh', 'Anantapur, Andhra Pradesh',
];

const DEFAULT_PROFILE = {
  region: 'Vidarbha, Maharashtra',
  land_size_acres: 3,
  land_ownership: 'owned',
  crop_types: ['cotton', 'pulses'],
  annual_income_inr: 110000,
  income_regularity: 'seasonal',
  off_season_income: 25000,
  total_savings_inr: 20000,
  assets: { livestock_value_inr: 40000, equipment_value_inr: 15000, vehicle_value_inr: 30000, gold_value_inr: 25000, property_other_inr: 0 },
  monthly_expenses_inr: 9500,
  household_size: 5,
  loan_amount: 75000,
  loan_purpose: 'Seeds / Inputs',
  existing_loans: { count: 1, total_outstanding_inr: 60000, sources: ['microfinance'] },
  past_defaults: false,
  irrigation_access: false,
  market_distance_km: 28,
  average_yield_quintals_per_acre: 4.1,
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function BiasSimulator() {
  const [baseProfile, setBaseProfile] = useState({ ...DEFAULT_PROFILE });
  const [modifiedProfile, setModifiedProfile] = useState({ ...DEFAULT_PROFILE });
  const [baseResult, setBaseResult] = useState(null);
  const [modResult, setModResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modLoading, setModLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparisonHistory, setComparisonHistory] = useState([]);

  const fetchProfile = async (profile) => {
    const res = await fetch(`${API_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const runBaseProfile = async () => {
    setLoading(true);
    setError('');
    setBaseResult(null);
    setModResult(null);
    setComparisonHistory([]);
    try {
      const data = await fetchProfile(baseProfile);
      setBaseResult(data);
      setModifiedProfile({ ...baseProfile });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runModifiedProfile = useCallback(
    debounce(async (profile) => {
      if (!baseResult) return;
      setModLoading(true);
      try {
        const data = await fetchProfile(profile);
        setModResult(data);
        setComparisonHistory(prev => [
          ...prev.slice(-9),
          {
            label: `Test ${prev.length + 1}`,
            base_rate: baseResult.loan_profile?.interest_rate_annual_percent || 0,
            mod_rate: data.loan_profile?.interest_rate_annual_percent || 0,
          },
        ]);
      } catch {
        // Silent fail on debounced calls
      } finally {
        setModLoading(false);
      }
    }, 1500),
    [baseResult]
  );

  const handleModChange = (field, value) => {
    const updated = { ...modifiedProfile, [field]: value };
    setModifiedProfile(updated);
  };

  const handleRunComparison = () => {
    runModifiedProfile(modifiedProfile);
  };

  const getChangedFields = () => {
    const changes = [];
    if (modifiedProfile.region !== baseProfile.region) changes.push(`Region: ${baseProfile.region} → ${modifiedProfile.region}`);
    if (modifiedProfile.annual_income_inr !== baseProfile.annual_income_inr) changes.push(`Income: ₹${baseProfile.annual_income_inr.toLocaleString()} → ₹${modifiedProfile.annual_income_inr.toLocaleString()}`);
    if (modifiedProfile.land_size_acres !== baseProfile.land_size_acres) changes.push(`Land: ${baseProfile.land_size_acres} → ${modifiedProfile.land_size_acres} acres`);
    if (modifiedProfile.loan_amount !== baseProfile.loan_amount) changes.push(`Loan: ₹${baseProfile.loan_amount.toLocaleString()} → ₹${modifiedProfile.loan_amount.toLocaleString()}`);
    if (modifiedProfile.irrigation_access !== baseProfile.irrigation_access) changes.push(`Irrigation: ${baseProfile.irrigation_access ? 'Yes' : 'No'} → ${modifiedProfile.irrigation_access ? 'Yes' : 'No'}`);
    if (modifiedProfile.land_ownership !== baseProfile.land_ownership) changes.push(`Ownership: ${baseProfile.land_ownership} → ${modifiedProfile.land_ownership}`);
    return changes;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
            </span>
            "What-If" Bias Simulator
          </h1>
          <p className="section-subtitle">
            Change one variable and see if the AI changes its decision unfairly. If the rate stays similar when you change
            only the region, the system is proving it's unbiased.
          </p>
        </div>

        {/* Step 1: Get baseline */}
        {!baseResult && (
          <div className="card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Step 1: Establish a Baseline Profile</h3>
            <p className="text-stone-500 mb-6">This farmer profile will be used as the control. Then you'll tweak variables to test for bias.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Region</label>
                <select value={baseProfile.region} onChange={e => setBaseProfile({ ...baseProfile, region: e.target.value })} className="input-field">
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Annual Income (₹)</label>
                <input type="number" value={baseProfile.annual_income_inr} onChange={e => setBaseProfile({ ...baseProfile, annual_income_inr: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Land Size (acres)</label>
                <input type="number" step="0.5" value={baseProfile.land_size_acres} onChange={e => setBaseProfile({ ...baseProfile, land_size_acres: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Loan Amount (₹)</label>
                <input type="number" value={baseProfile.loan_amount} onChange={e => setBaseProfile({ ...baseProfile, loan_amount: Number(e.target.value) })} className="input-field" />
              </div>
            </div>

            <button onClick={runBaseProfile} disabled={loading} className="btn-primary" id="run-baseline">
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Getting Baseline...
                </>
              ) : 'Get Baseline Rate from AI'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}
          </div>
        )}

        {/* Step 2: Modify and compare */}
        {baseResult && (
          <div className="space-y-6">
            {/* Baseline result */}
            <div className="card p-6 bg-gradient-to-br from-brand-50/50 to-white border-brand-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">📌 Baseline Result</h3>
                <button onClick={() => { setBaseResult(null); setModResult(null); setComparisonHistory([]); }} className="btn-ghost text-sm">
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-stone-100 text-center">
                  <p className="text-2xl font-bold text-brand-600">{baseResult.loan_profile?.interest_rate_annual_percent || '—'}%</p>
                  <p className="text-xs text-stone-400">Interest Rate</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-100 text-center">
                  <p className="text-2xl font-bold text-stone-800">{baseResult.wealth_context?.wealth_percentile || '—'}</p>
                  <p className="text-xs text-stone-400">Percentile</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-100 text-center">
                  <p className="text-2xl font-bold text-stone-800">₹{(baseResult.loan_profile?.loan_limit_inr || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-stone-400">Loan Limit</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-100 text-center">
                  <p className="text-2xl font-bold text-stone-800">{baseResult.loan_profile?.fairness_score || '—'}/10</p>
                  <p className="text-xs text-stone-400">Fairness</p>
                </div>
              </div>
            </div>

            {/* Modification controls */}
            <div className="card p-6">
              <h3 className="font-bold text-stone-900 mb-1">🎛️ Modify Variables</h3>
              <p className="text-sm text-stone-500 mb-4">Change one or more variables and click "Compare" to see if the AI decision changes unfairly.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Region</label>
                  <select value={modifiedProfile.region} onChange={e => handleModChange('region', e.target.value)} className="input-field">
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Annual Income: ₹{modifiedProfile.annual_income_inr.toLocaleString()}</label>
                  <input type="range" min="20000" max="1500000" step="10000" value={modifiedProfile.annual_income_inr} onChange={e => handleModChange('annual_income_inr', Number(e.target.value))} className="w-full accent-brand-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Land Size: {modifiedProfile.land_size_acres} acres</label>
                  <input type="range" min="0.5" max="25" step="0.5" value={modifiedProfile.land_size_acres} onChange={e => handleModChange('land_size_acres', Number(e.target.value))} className="w-full accent-brand-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Loan Amount: ₹{modifiedProfile.loan_amount.toLocaleString()}</label>
                  <input type="range" min="10000" max="500000" step="5000" value={modifiedProfile.loan_amount} onChange={e => handleModChange('loan_amount', Number(e.target.value))} className="w-full accent-brand-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Land Ownership</label>
                  <select value={modifiedProfile.land_ownership} onChange={e => handleModChange('land_ownership', e.target.value)} className="input-field">
                    <option value="owned">Owned</option>
                    <option value="leased">Leased</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={modifiedProfile.irrigation_access} onChange={e => handleModChange('irrigation_access', e.target.checked)} className="w-4 h-4 text-brand-600 rounded" />
                    <span className="text-sm font-medium text-stone-700">Has Irrigation Access</span>
                  </label>
                </div>
              </div>

              {/* Show what changed */}
              {getChangedFields().length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Changes from baseline:</p>
                  {getChangedFields().map((c, i) => (
                    <p key={i} className="text-sm text-amber-800">• {c}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleRunComparison}
                disabled={modLoading || getChangedFields().length === 0}
                className="btn-primary"
                id="run-comparison"
              >
                {modLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Comparing...
                  </>
                ) : 'Run Comparison'}
              </button>
            </div>

            {/* Comparison Result */}
            {modResult && (
              <div className="card p-6">
                <h3 className="font-bold text-stone-900 mb-4">📊 Side-by-Side Comparison</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Baseline', data: baseResult, color: 'brand' },
                    { label: 'Modified', data: modResult, color: 'violet' },
                  ].map(({ label, data, color }) => (
                    <div key={label} className={`p-4 rounded-xl border ${color === 'brand' ? 'border-brand-200 bg-brand-50/30' : 'border-violet-200 bg-violet-50/30'}`}>
                      <p className={`text-xs font-semibold uppercase ${color === 'brand' ? 'text-brand-600' : 'text-violet-600'} mb-2`}>{label}</p>
                      <p className="text-3xl font-bold text-stone-900 mb-1">{data.loan_profile?.interest_rate_annual_percent || '—'}%</p>
                      <p className="text-sm text-stone-500">Percentile: {data.wealth_context?.wealth_percentile}</p>
                      <p className="text-sm text-stone-500">Limit: ₹{(data.loan_profile?.loan_limit_inr || 0).toLocaleString('en-IN')}</p>
                      <p className="text-sm text-stone-500">Fairness: {data.loan_profile?.fairness_score}/10</p>
                    </div>
                  ))}
                </div>

                {/* Rate difference assessment */}
                {(() => {
                  const baseRate = baseResult.loan_profile?.interest_rate_annual_percent || 0;
                  const modRate = modResult.loan_profile?.interest_rate_annual_percent || 0;
                  const diff = Math.abs(modRate - baseRate);
                  const isFair = diff < 3;
                  return (
                    <div className={`p-4 rounded-xl border ${isFair ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                      <p className={`font-semibold ${isFair ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {isFair ? '✅ No significant bias detected' : '⚠️ Notable rate difference detected'}
                      </p>
                      <p className={`text-sm mt-1 ${isFair ? 'text-emerald-700' : 'text-amber-700'}`}>
                        Rate difference: {diff.toFixed(1)}% — {isFair
                          ? 'The rate change is proportional to the economic change, indicating fair treatment.'
                          : 'This may indicate the AI weighs this factor heavily. Review the changed variables.'}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* History chart */}
            {comparisonHistory.length > 1 && (
              <div className="card p-6">
                <h3 className="font-bold text-stone-900 mb-4">📈 Comparison History</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend />
                      <Bar dataKey="base_rate" name="Baseline" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="mod_rate" name="Modified" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
