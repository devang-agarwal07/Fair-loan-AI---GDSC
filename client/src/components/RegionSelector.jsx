import { useState, useRef, useEffect, useMemo } from 'react';
import INDIAN_REGIONS from '../data/indianRegions';

/**
 * RegionSelector — Searchable nested dropdown for Indian states & districts.
 * Features:
 *  - Type to search across states and districts
 *  - Click a state to expand its districts
 *  - Selection outputs "District, State" format
 *  - Accessible keyboard navigation
 */
export default function RegionSelector({ value, onChange, error, id = 'region-selector' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedState, setExpandedState] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const states = Object.keys(INDIAN_REGIONS);

  // Filtered results based on search
  const filteredResults = useMemo(() => {
    if (!search.trim()) {
      return states.map(state => ({
        state,
        districts: INDIAN_REGIONS[state],
        matchType: 'all',
      }));
    }

    const q = search.toLowerCase().trim();
    const results = [];

    for (const state of states) {
      const stateMatch = state.toLowerCase().includes(q);
      const matchingDistricts = INDIAN_REGIONS[state].filter(d =>
        d.toLowerCase().includes(q)
      );

      if (stateMatch) {
        results.push({
          state,
          districts: INDIAN_REGIONS[state],
          matchType: 'state',
        });
      } else if (matchingDistricts.length > 0) {
        results.push({
          state,
          districts: matchingDistricts,
          matchType: 'district',
        });
      }
    }

    return results;
  }, [search]);

  const handleSelect = (district, state) => {
    const formatted = `${district}, ${state}`;
    onChange(formatted);
    setOpen(false);
    setSearch('');
    setExpandedState(null);
  };

  const handleSelectState = (state) => {
    onChange(state);
    setOpen(false);
    setSearch('');
    setExpandedState(null);
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    if (!open) setOpen(true);
    setExpandedState(null);
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const clearSelection = () => {
    onChange('');
    setSearch('');
    setOpen(true);
    inputRef.current?.focus();
  };

  const isSearching = search.trim().length > 0;
  const noResults = isSearching && filteredResults.length === 0;

  return (
    <div ref={containerRef} className="relative" id={id}>
      <label className="label-text">Region / District *</label>

      {/* Input field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="input-field pl-9 pr-10"
          placeholder={value || 'Search state or district...'}
          value={open ? search : (value || '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          readOnly={!open && !!value}
          id={`${id}-input`}
        />
        {value && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
            <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Selected value chip */}
      {value && !open && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium border border-brand-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {value}
          </span>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {noResults && (
            <div className="p-4 text-center">
              <p className="text-stone-500 text-sm mb-1">No matching state or district found</p>
              <p className="text-stone-400 text-xs">More regions will be added in future updates</p>
            </div>
          )}

          {filteredResults.map(({ state, districts, matchType }) => (
            <div key={state} className="border-b border-stone-50 last:border-0">
              {/* State header */}
              <button
                type="button"
                onClick={() => {
                  if (isSearching && matchType === 'state') {
                    handleSelectState(state);
                  } else {
                    setExpandedState(expandedState === state ? null : state);
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors text-left"
              >
                <span className="font-medium text-stone-800 text-sm">{state}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">{districts.length} districts</span>
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                      expandedState === state || (isSearching && matchType === 'district') ? 'rotate-180' : ''
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {/* Districts list */}
              {(expandedState === state || (isSearching && matchType === 'district')) && (
                <div className="bg-stone-50/50 border-t border-stone-100">
                  {districts.map(district => (
                    <button
                      key={district}
                      type="button"
                      onClick={() => handleSelect(district, state)}
                      className="w-full text-left px-6 py-2 text-sm text-stone-600 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-3 h-3 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {district}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
