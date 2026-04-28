import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Interest rate benchmarks with verifiable sources.
 * These are based on publicly available data from RBI and field studies.
 */
const BENCHMARK_RATES = {
  moneylender: {
    rate: 36,
    label: 'Moneylender',
    source: 'RBI Report on Trend & Progress of Banking in India, 2023',
    note: 'Informal sector average: 24–60% p.a.',
  },
  bank: {
    rate: 10.5,
    label: 'Bank (if eligible)',
    source: 'SBI Kisan Credit Card rate, FY2024–25',
    note: 'Most small farmers fail eligibility criteria',
  },
};

export default function ComparisonChart({ fairloanRate }) {
  const data = [
    { name: BENCHMARK_RATES.moneylender.label, rate: BENCHMARK_RATES.moneylender.rate, color: '#dc2626' },
    { name: BENCHMARK_RATES.bank.label, rate: BENCHMARK_RATES.bank.rate, color: '#f59e0b' },
    { name: 'FairLoan AI', rate: fairloanRate, color: '#059669' },
  ];

  return (
    <div className="card p-6" id="comparison-chart">
      <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Rate Comparison</h4>
      <p className="text-sm text-stone-400 mb-6">How your FairLoan rate compares to alternatives</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 13, fill: '#78716c' }}
              axisLine={{ stroke: '#d6d3d1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#a8a29e' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 40]}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Interest Rate']}
              contentStyle={{
                background: '#1c1917',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="rate" radius={[8, 8, 0, 0]} maxBarSize={60}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-2 px-2">
        <div className="w-2 h-2 bg-brand-600 rounded-full" />
        <p className="text-sm text-stone-500">
          You save <span className="font-bold text-brand-700">₹{Math.round(((BENCHMARK_RATES.moneylender.rate - fairloanRate) / 100) * 100000).toLocaleString()}</span> per year per ₹1,00,000 compared to a moneylender
        </p>
      </div>

      {/* Source citations */}
      <div className="mt-4 pt-3 border-t border-stone-100 space-y-1">
        <p className="text-[10px] text-stone-400 leading-tight">
          <span className="font-medium">Moneylender rate ({BENCHMARK_RATES.moneylender.rate}%):</span> {BENCHMARK_RATES.moneylender.source}. {BENCHMARK_RATES.moneylender.note}.
        </p>
        <p className="text-[10px] text-stone-400 leading-tight">
          <span className="font-medium">Bank rate ({BENCHMARK_RATES.bank.rate}%):</span> {BENCHMARK_RATES.bank.source}. {BENCHMARK_RATES.bank.note}.
        </p>
      </div>
    </div>
  );
}
