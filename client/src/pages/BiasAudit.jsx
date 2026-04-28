import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import BiasReportCard from '../components/BiasReportCard';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function BiasAudit() {
  const [report, setReport] = useState(null);
  const [health, setHealth] = useState(null);
  const [fairness, setFairness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('community'); // 'community' | 'upload'
  const [error, setError] = useState('');
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState('');

  useEffect(() => {
    // Load health and fairness on mount with proper loading/error handling
    setLoadingCards(true);
    setCardsError('');
    Promise.all([
      fetch(`${API_URL}/api/audit/health`).then(r => {
        if (!r.ok) throw new Error(`Health API returned ${r.status}`);
        return r.json();
      }),
      fetch(`${API_URL}/api/audit/fairness`).then(r => {
        if (!r.ok) throw new Error(`Fairness API returned ${r.status}`);
        return r.json();
      }),
    ])
      .then(([h, f]) => {
        setHealth(h);
        setFairness(f);
      })
      .catch(err => {
        console.error('Failed to load audit data:', err);
        setCardsError('Could not connect to the audit server. Please make sure the backend is running.');
      })
      .finally(() => setLoadingCards(false));
  }, []);

  const runCommunityAudit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ use_community_data: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    import('papaparse').then(Papa => {
      Papa.default.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          setLoading(true);
          setError('');
          try {
            // Transform CSV rows to proper types
            const dataset = results.data.map(row => ({
              ...row,
              land_size_acres: Number(row.land_size_acres) || 0,
              annual_income_inr: Number(row.annual_income_inr) || 0,
              total_savings_inr: Number(row.total_savings_inr) || 0,
              monthly_expenses_inr: Number(row.monthly_expenses_inr) || 0,
              household_size: Number(row.household_size) || 1,
              market_distance_km: Number(row.market_distance_km) || 0,
              irrigation_access: row.irrigation_access === 'true',
              past_defaults: row.past_defaults === 'true',
              assets: {
                livestock_value_inr: Number(row.livestock_value_inr) || 0,
                equipment_value_inr: Number(row.equipment_value_inr) || 0,
                vehicle_value_inr: Number(row.vehicle_value_inr) || 0,
                gold_value_inr: Number(row.gold_value_inr) || 0,
                property_other_inr: Number(row.property_other_inr) || 0,
              },
              existing_loans: {
                count: Number(row.existing_loan_count) || 0,
                total_outstanding_inr: Number(row.existing_loan_outstanding) || 0,
                sources: (row.existing_loan_sources || '').split(',').filter(Boolean),
              },
            }));

            const res = await fetch(`${API_URL}/api/audit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataset }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setReport(data.report);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
      });
    });
  };

  // Skeleton placeholder for loading cards
  const CardSkeleton = () => (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-28 bg-stone-200 rounded" />
        <div className="h-6 w-16 bg-stone-200 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-stone-100 rounded-xl h-16" />
        <div className="p-3 bg-stone-100 rounded-xl h-16" />
      </div>
      <div className="h-4 w-3/4 bg-stone-200 rounded" />
    </div>
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-brand-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </span>
            Bias Audit Dashboard
          </h1>
          <p className="section-subtitle">
            Inspect datasets for hidden unfairness. Measure, flag, and understand bias with mathematical metrics — not AI opinions.
          </p>
        </div>

        {/* Dataset Health + Algorithm Fairness — with loading & error states */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {loadingCards ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : cardsError ? (
            <div className="lg:col-span-2 card p-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <div>
                  <p className="font-semibold text-red-800">Failed to load audit data</p>
                  <p className="text-sm text-red-600 mt-1">{cardsError}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Dataset Health */}
              {health && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-stone-900">Dataset Health</h3>
                    <div className={`chip text-xs ${health.health_score >= 70 ? 'bg-emerald-100 text-emerald-700' : health.health_score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {health.health_score}/100
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-stone-50 rounded-xl text-center">
                      <p className="text-lg font-bold text-stone-900">{health.total_entries}</p>
                      <p className="text-xs text-stone-400">Total Entries</p>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl text-center">
                      <p className="text-lg font-bold text-stone-900">{health.sufficient_regions}/{health.total_regions}</p>
                      <p className="text-xs text-stone-400">Regions (5+ entries)</p>
                    </div>
                  </div>
                  {health.warnings.length > 0 && (
                    <div className="space-y-1.5">
                      {health.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">{w}</p>
                      ))}
                    </div>
                  )}
                  {health.warnings.length === 0 && (
                    <p className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg">✅ Dataset looks healthy</p>
                  )}
                </div>
              )}

              {/* Algorithm Fairness */}
              {fairness && fairness.quintiles && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-stone-900">Algorithm Fairness</h3>
                    <div className={`chip text-xs ${fairness.fairness_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {fairness.fairness_verified ? '✓ Verified Fair' : '✗ Issues Found'}
                    </div>
                  </div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fairness.quintiles}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 'auto']} />
                        <Tooltip
                          contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                          formatter={(v, name) => name === 'avg_rate' ? [`${v}%`, 'Avg Interest Rate'] : [v, name]}
                        />
                        <Bar dataKey="avg_rate" radius={[6, 6, 0, 0]} maxBarSize={35}>
                          {fairness.quintiles.map((_, i) => (
                            <Cell key={i} fill={['#059669', '#10b981', '#d97706', '#ea580c', '#dc2626'][i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">{fairness.explanation}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Audit Controls */}
        {!report && (
          <div className="card p-6 sm:p-8">
            <h3 className="text-xl font-bold text-stone-900 mb-2">Run Bias Audit</h3>
            <p className="text-stone-500 mb-6">
              Choose a dataset to analyze for hidden unfairness and discrimination patterns.
            </p>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('community')}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'community' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Our Community Data
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'upload' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Upload Your Dataset
              </button>
            </div>

            {activeTab === 'community' ? (
              <div className="text-center py-6">
                <p className="text-stone-600 mb-4">
                  Analyze our {health?.total_entries || 20}-entry community dataset for bias across regions, income levels, land ownership, and more.
                </p>
                <button onClick={runCommunityAudit} disabled={loading} className="btn-primary" id="run-community-audit">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                      Run Bias Audit on Community Data
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-stone-600 mb-4">
                  Upload any lending dataset (CSV) to scan for bias. Must include columns: region, annual_income_inr, land_size_acres.
                </p>
                <label className="btn-primary cursor-pointer inline-flex" id="upload-audit-dataset">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload CSV for Audit
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}
          </div>
        )}

        {/* Report */}
        {report && (
          <div>
            <button
              onClick={() => setReport(null)}
              className="btn-ghost mb-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Run Another Audit
            </button>
            <BiasReportCard report={report} />
          </div>
        )}
      </div>
    </div>
  );
}
