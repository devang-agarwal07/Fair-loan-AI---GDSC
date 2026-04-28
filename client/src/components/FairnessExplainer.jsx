export default function FairnessExplainer({ score, explanation }) {
  const getColor = (s) => {
    if (s >= 8) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-500/30', fill: '#059669' };
    if (s >= 6) return { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700', ring: 'ring-lime-500/30', fill: '#65a30d' };
    if (s >= 4) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-500/30', fill: '#d97706' };
    return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'ring-orange-500/30', fill: '#ea580c' };
  };

  const colors = getColor(score);
  const percentage = (score / 10) * 100;

  return (
    <div className={`card p-6 ${colors.bg} ${colors.border}`} id="fairness-explainer">
      <div className="flex items-start gap-4">
        {/* Score circle */}
        <div className="relative flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle
              cx="36" cy="36" r="30" fill="none" stroke={colors.fill} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 1.885} ${188.5 - percentage * 1.885}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-extrabold ${colors.text}`}>{score}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-stone-900">Fairness Index</h4>
            <div className="group relative">
              <svg className="w-4 h-4 text-stone-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-stone-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Score of 10 = most favourable terms (given to the poorest applicants). Score of 1 = standard market terms (given to the wealthiest).
              </div>
            </div>
          </div>
          <p className={`text-sm ${colors.text} font-medium mb-2`}>
            {score >= 8 ? 'Highly Favourable Terms' : score >= 6 ? 'Favourable Terms' : score >= 4 ? 'Moderate Terms' : 'Standard Terms'}
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
