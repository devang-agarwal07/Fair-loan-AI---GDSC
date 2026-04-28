import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import DatasetViewer from '../components/DatasetViewer';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ExploreDataset() {
  const [data, setData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/dataset`).then(r => r.json()),
      fetch(`${API_URL}/api/dataset/regions`).then(r => r.json()),
      fetch(`${API_URL}/api/dataset/stats`).then(r => r.json()),
    ])
      .then(([dataRes, regionsRes, statsRes]) => {
        setData(dataRes.data || []);
        setRegions(regionsRes.regions || []);
        setStats(statsRes);
      })
      .catch(err => console.error('Failed to load dataset:', err))
      .finally(() => setLoading(false));
  }, []);

  // Prepare chart data
  const wealthHistogram = (() => {
    if (!data.length) return [];
    const scores = data.map(e => e._wealth_score || 0);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const binCount = 8;
    const binSize = (max - min) / binCount || 1;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${Math.round((min + i * binSize) / 1000)}k`,
      count: 0,
    }));
    scores.forEach(s => {
      const idx = Math.min(Math.floor((s - min) / binSize), binCount - 1);
      bins[idx].count++;
    });
    return bins;
  })();

  const incomeScatter = data.map(e => ({
    income: (e.annual_income_inr || 0) / 1000,
    wealth: (e._wealth_score || 0) / 1000,
    region: e.region,
  }));

  const regionAvgWealth = (() => {
    const map = {};
    data.forEach(e => {
      const state = e.region?.split(',').pop()?.trim() || e.region || 'Unknown';
      if (!map[state]) map[state] = { total: 0, count: 0 };
      map[state].total += e._wealth_score || 0;
      map[state].count++;
    });
    return Object.entries(map)
      .map(([region, { total, count }]) => ({
        region: region.length > 15 ? region.substring(0, 12) + '...' : region,
        avgWealth: Math.round(total / count / 1000),
      }))
      .sort((a, b) => b.avgWealth - a.avgWealth);
  })();

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 text-brand-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-stone-500">Loading dataset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title">Explore Community Dataset</h1>
        <p className="section-subtitle">
          Anonymised economic profiles contributed by the community. This data powers fair loan assessments.
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Entries', value: stats.total_entries, icon: '📊' },
            { label: 'Regions', value: stats.unique_regions, icon: '🗺️' },
            { label: 'Median Income', value: `₹${(stats.avg_income / 1000).toFixed(0)}k`, icon: '💰' },
            { label: 'Median Wealth Score', value: `${(stats.avg_wealth_score / 1000).toFixed(0)}k`, icon: '📈' },
          ].map((s, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-stone-900">{s.value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Wealth Histogram */}
        <div className="card p-6">
          <h3 className="font-bold text-stone-900 mb-1">Wealth Score Distribution</h3>
          <p className="text-sm text-stone-400 mb-4">How wealth is distributed across the dataset</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wealthHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                  formatter={(v) => [v, 'Farmers']}
                />
                <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Wealth Scatter */}
        <div className="card p-6">
          <h3 className="font-bold text-stone-900 mb-1">Income vs Wealth Score</h3>
          <p className="text-sm text-stone-400 mb-4">Correlation between annual income and overall wealth</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="income" name="Income" unit="k" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="wealth" name="Wealth" unit="k" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                  formatter={(v, name) => [`${v}k`, name === 'income' ? 'Income (₹)' : 'Wealth Score']}
                />
                <Scatter data={incomeScatter} fill="#059669" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Wealth by Region */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-bold text-stone-900 mb-1">Average Wealth by Region</h3>
          <p className="text-sm text-stone-400 mb-4">Regional comparison of average wealth scores (in thousands)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionAvgWealth} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} unit="k" />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                  formatter={(v) => [`${v}k`, 'Wealth Score']}
                />
                <Bar dataKey="avgWealth" fill="#059669" radius={[0, 6, 6, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dataset Table */}
      <DatasetViewer data={data} regions={regions} />
    </div>
  );
}
