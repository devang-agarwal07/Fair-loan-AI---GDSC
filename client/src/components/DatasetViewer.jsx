import { useState } from 'react';

export default function DatasetViewer({ data, regions }) {
  const [regionFilter, setRegionFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = regionFilter
    ? data.filter(e => e.region && e.region.toLowerCase().includes(regionFilter.toLowerCase()))
    : data;

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const formatCurrency = (n) => {
    if (n == null) return '—';
    return `₹${Number(n).toLocaleString('en-IN')}`;
  };

  return (
    <div className="card overflow-hidden" id="dataset-viewer">
      {/* Filter bar */}
      <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="font-bold text-stone-900">Community Dataset</h3>
          <p className="text-sm text-stone-500">{filtered.length} entries {regionFilter && `in "${regionFilter}"`}</p>
        </div>
        <select
          className="select-field max-w-xs"
          value={regionFilter}
          onChange={e => { setRegionFilter(e.target.value); setPage(1); }}
          id="dataset-region-filter"
        >
          <option value="">All Regions</option>
          {(regions || []).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Region</th>
              <th className="px-4 py-3 text-left font-semibold">Land (acres)</th>
              <th className="px-4 py-3 text-left font-semibold">Ownership</th>
              <th className="px-4 py-3 text-left font-semibold">Crops</th>
              <th className="px-4 py-3 text-left font-semibold">Annual Income</th>
              <th className="px-4 py-3 text-left font-semibold">Savings</th>
              <th className="px-4 py-3 text-left font-semibold">Loans Outstanding</th>
              <th className="px-4 py-3 text-left font-semibold">Household</th>
              <th className="px-4 py-3 text-left font-semibold">Irrigation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginated.map((entry, i) => (
              <tr key={entry.id || i} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-4 py-3 text-stone-800 font-medium whitespace-nowrap">{entry.region}</td>
                <td className="px-4 py-3 text-stone-700">{entry.land_size_acres}</td>
                <td className="px-4 py-3">
                  <span className={`chip text-xs ${
                    entry.land_ownership === 'owned' ? 'bg-emerald-50 text-emerald-700' :
                    entry.land_ownership === 'leased' ? 'bg-amber-50 text-amber-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>{entry.land_ownership}</span>
                </td>
                <td className="px-4 py-3 text-stone-600 text-xs">{(entry.crop_types || []).join(', ')}</td>
                <td className="px-4 py-3 text-stone-700 font-medium">{formatCurrency(entry.annual_income_inr)}</td>
                <td className="px-4 py-3 text-stone-700">{formatCurrency(entry.total_savings_inr)}</td>
                <td className="px-4 py-3 text-stone-700">{formatCurrency(entry.existing_loans?.total_outstanding_inr)}</td>
                <td className="px-4 py-3 text-stone-700 text-center">{entry.household_size}</td>
                <td className="px-4 py-3">
                  {entry.irrigation_access ? (
                    <span className="chip-green text-xs">Yes</span>
                  ) : (
                    <span className="chip-red text-xs">No</span>
                  )}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-stone-400">
                  No entries found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-stone-100 flex items-center justify-between">
          <p className="text-sm text-stone-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost text-sm px-3 disabled:opacity-30"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === p ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost text-sm px-3 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
