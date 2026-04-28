import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const gradeColors = { A: '#059669', B: '#65a30d', C: '#d97706', D: '#dc2626' };

export default function BiasReportCard({ report }) {
  if (!report) return null;
  const { summary, demographic_parity, disparate_impact, outlier_analysis } = report;

  return (
    <div className="space-y-6 animate-slide-up" id="bias-report">
      {/* Overall Score Card */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-white to-brand-50/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Bias Audit Report</h2>
            <p className="text-stone-500 text-sm mt-1">
              Analyzed {summary.dataset_size} entries • {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg"
              style={{ backgroundColor: gradeColors[summary.fairness_grade] || '#78716c' }}
            >
              {summary.fairness_grade}
            </div>
            <div>
              <p className="text-3xl font-extrabold text-stone-900">{summary.overall_fairness_score}</p>
              <p className="text-xs text-stone-400">/ 100</p>
            </div>
          </div>
        </div>

        {/* Bias Flags */}
        {summary.bias_flags.length > 0 ? (
          <div className="space-y-2">
            {summary.bias_flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <span className="text-sm text-red-800">{flag}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-sm text-emerald-800 font-medium">No significant bias detected across any dimension</span>
          </div>
        )}
      </div>

      {/* Demographic Parity */}
      <div className="card p-6">
        <h3 className="font-bold text-stone-900 mb-1">Demographic Parity Analysis</h3>
        <p className="text-sm text-stone-400 mb-4">Are average interest rates similar across different groups?</p>
        <div className="space-y-4">
          {demographic_parity.map((dp, i) => {
            const groups = Object.entries(dp.groups);
            const chartData = groups.map(([name, data]) => ({
              name: name.length > 12 ? name.slice(0, 10) + '…' : name,
              rate: data.avg_rate,
              count: data.count,
            }));
            const parityColor = dp.parity_label === 'Excellent' ? 'text-emerald-600 bg-emerald-50' :
              dp.parity_label === 'Good' ? 'text-lime-600 bg-lime-50' :
                dp.parity_label === 'Moderate' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

            return (
              <div key={i} className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-stone-800 capitalize">
                    {dp.group_field.replace(/_/g, ' ')}
                  </h4>
                  <span className={`chip text-xs ${parityColor}`}>{dp.parity_label} (gap: {dp.max_rate_gap}%)</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                        formatter={(v, name) => name === 'rate' ? [`${v}%`, 'Avg Rate'] : [v, 'Entries']}
                      />
                      <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {chartData.map((_, j) => (
                          <Cell key={j} fill={j % 2 === 0 ? '#059669' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disparate Impact */}
      <div className="card p-6">
        <h3 className="font-bold text-stone-900 mb-1">Disparate Impact Analysis</h3>
        <p className="text-sm text-stone-400 mb-4">
          Does any group get favorable rates less than 80% as often as the best group? (Legal threshold)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {disparate_impact.map((di, i) => {
            const passed = di.passes_80_percent_rule;
            return (
              <div key={i} className={`p-4 rounded-xl border ${passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <p className="text-xs text-stone-500 uppercase font-semibold mb-1 capitalize">
                  {di.group_field.replace(/_/g, ' ')}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
                    {Math.round(di.impact_ratio * 100)}%
                  </span>
                  <span className={`text-xs font-medium ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {passed ? '✓ Passes 80% rule' : '✗ Fails 80% rule'}
                  </span>
                </div>
                {di.disadvantaged_groups.length > 0 && (
                  <p className="text-xs text-red-600 mt-2">
                    Disadvantaged: {di.disadvantaged_groups.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Outlier Analysis */}
      <div className="card p-6">
        <h3 className="font-bold text-stone-900 mb-1">Outlier Detection</h3>
        <p className="text-sm text-stone-400 mb-4">
          Entries whose estimated rates deviate &gt;2 standard deviations from the mean
        </p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-stone-50 rounded-xl">
            <p className="text-xl font-bold text-stone-900">{outlier_analysis.mean_rate}%</p>
            <p className="text-xs text-stone-400">Mean Rate</p>
          </div>
          <div className="text-center p-3 bg-stone-50 rounded-xl">
            <p className="text-xl font-bold text-stone-900">±{outlier_analysis.std_dev}%</p>
            <p className="text-xs text-stone-400">Std Dev</p>
          </div>
          <div className="text-center p-3 bg-stone-50 rounded-xl">
            <p className={`text-xl font-bold ${outlier_analysis.outlier_count === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {outlier_analysis.outlier_count}
            </p>
            <p className="text-xs text-stone-400">Outliers</p>
          </div>
        </div>
        {outlier_analysis.outlier_count === 0 && (
          <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">
            ✅ No statistical outliers detected — rate distribution is normal.
          </p>
        )}
      </div>
    </div>
  );
}
