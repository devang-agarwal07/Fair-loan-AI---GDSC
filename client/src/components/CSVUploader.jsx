import { useState, useRef } from 'react';
import Papa from 'papaparse';

const SAMPLE_CSV = `region,land_size_acres,land_ownership,crop_types,annual_income_inr,income_regularity,off_season_income,total_savings_inr,livestock_value_inr,equipment_value_inr,vehicle_value_inr,gold_value_inr,property_other_inr,monthly_expenses_inr,household_size,loan_amount,loan_purpose,existing_loan_count,existing_loan_outstanding,existing_loan_sources,past_defaults,irrigation_access,market_distance_km,average_yield_quintals_per_acre
"Vidarbha, Maharashtra",3,owned,"cotton,pulses",110000,seasonal,25000,20000,40000,15000,30000,25000,0,9500,5,75000,Seeds / Inputs,1,60000,microfinance,false,false,28,4.1`;

export default function CSVUploader({ onSubmit, loading }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Parse error: ${results.errors[0].message}`);
          return;
        }
        if (results.data.length === 0) {
          setError('CSV file is empty');
          return;
        }
        // Validate required fields
        const first = results.data[0];
        if (!first.region || !first.land_size_acres || !first.annual_income_inr || !first.loan_amount) {
          setError('CSV must include: region, land_size_acres, annual_income_inr, loan_amount');
          return;
        }
        setData(results.data);
      },
      error: (err) => setError(err.message),
    });
  };

  const transformRow = (row) => ({
    region: row.region || '',
    land_size_acres: Number(row.land_size_acres) || 0,
    land_ownership: row.land_ownership || 'owned',
    crop_types: (row.crop_types || '').split(',').map(c => c.trim()).filter(Boolean),
    annual_income_inr: Number(row.annual_income_inr) || 0,
    income_regularity: row.income_regularity || 'seasonal',
    off_season_income: Number(row.off_season_income) || 0,
    total_savings_inr: Number(row.total_savings_inr) || 0,
    assets: {
      livestock_value_inr: Number(row.livestock_value_inr) || 0,
      equipment_value_inr: Number(row.equipment_value_inr) || 0,
      vehicle_value_inr: Number(row.vehicle_value_inr) || 0,
      gold_value_inr: Number(row.gold_value_inr) || 0,
      property_other_inr: Number(row.property_other_inr) || 0,
    },
    monthly_expenses_inr: Number(row.monthly_expenses_inr) || 0,
    household_size: Number(row.household_size) || 1,
    loan_amount: Number(row.loan_amount) || 0,
    loan_purpose: row.loan_purpose || 'Other',
    existing_loans: {
      count: Number(row.existing_loan_count) || 0,
      total_outstanding_inr: Number(row.existing_loan_outstanding) || 0,
      sources: (row.existing_loan_sources || '').split(',').map(s => s.trim()).filter(Boolean),
    },
    past_defaults: row.past_defaults === 'true',
    irrigation_access: row.irrigation_access !== 'false',
    market_distance_km: Number(row.market_distance_km) || 0,
    average_yield_quintals_per_acre: Number(row.average_yield_quintals_per_acre) || 0,
  });

  const handleSubmit = () => {
    if (!data || data.length === 0) return;
    onSubmit(transformRow(data[0]));
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fairloan_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card p-6 sm:p-8 animate-slide-up">
      <h3 className="text-xl font-bold text-stone-900 mb-2">Upload CSV</h3>
      <p className="text-stone-500 mb-6">Upload a CSV file with your farmer profile data instead of filling the form.</p>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all duration-200"
        id="csv-dropzone"
      >
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-file-input" />
        <svg className="w-12 h-12 text-stone-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        {fileName ? (
          <p className="text-brand-700 font-semibold">{fileName}</p>
        ) : (
          <p className="text-stone-500">Click to select a CSV file</p>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {data && data.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-stone-800 mb-3">Preview ({data.length} row{data.length > 1 ? 's' : ''})</h4>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr>
                  {Object.keys(data[0]).slice(0, 6).map(key => (
                    <th key={key} className="px-3 py-2 text-left font-semibold text-stone-600 whitespace-nowrap">{key}</th>
                  ))}
                  {Object.keys(data[0]).length > 6 && <th className="px-3 py-2 text-stone-400">...</th>}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 3).map((row, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    {Object.values(row).slice(0, 6).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-stone-700 whitespace-nowrap">{String(val).substring(0, 25)}</td>
                    ))}
                    {Object.keys(row).length > 6 && <td className="px-3 py-2 text-stone-400">...</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-4 w-full sm:w-auto" id="csv-submit">
            {loading ? 'Analyzing...' : 'Get Loan Profile from CSV'}
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-stone-100">
        <button onClick={downloadSample} className="btn-ghost text-sm" id="csv-download-sample">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
          </svg>
          Download Sample CSV Template
        </button>
      </div>
    </div>
  );
}
