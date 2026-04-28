export default function WealthMeter({ percentile, label, sampleSize }) {
  // Color stops for the gradient
  const getMarkerColor = (p) => {
    if (p <= 20) return '#dc2626';
    if (p <= 40) return '#ea580c';
    if (p <= 60) return '#eab308';
    if (p <= 80) return '#65a30d';
    return '#16a34a';
  };

  return (
    <div className="card p-6" id="wealth-meter">
      <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Your Community Standing</h4>

      {/* Gradient Bar */}
      <div className="relative mb-3">
        <div className="w-full h-5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 via-60% to-green-600 shadow-inner" />

        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
          style={{ left: `${Math.max(2, Math.min(98, percentile))}%` }}
        >
          <div className="relative">
            <div
              className="w-7 h-7 rounded-full border-[3px] border-white shadow-lg -translate-x-1/2"
              style={{ backgroundColor: getMarkerColor(percentile) }}
            />
            {/* Arrow */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold text-white whitespace-nowrap"
              style={{ backgroundColor: getMarkerColor(percentile) }}
            >
              {percentile}th
            </div>
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-1 px-1">
          <span className="text-xs text-stone-400">Poorest</span>
          <span className="text-xs text-stone-400">Wealthiest</span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-8 text-center">
        <p className="text-lg font-bold text-stone-900">
          You are in the <span className="text-brand-600">{label}</span> of your region
        </p>
        <p className="text-sm text-stone-400 mt-1">
          Based on {sampleSize} local farmers in our dataset
        </p>
      </div>
    </div>
  );
}
