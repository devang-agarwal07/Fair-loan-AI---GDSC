import { useState } from 'react';

const CROP_OPTIONS = ['wheat', 'rice', 'cotton', 'sugarcane', 'vegetables', 'pulses', 'other'];
const LOAN_SOURCES = ['bank', 'microfinance', 'moneylender', 'family'];
const PURPOSES = ['Seeds / Inputs', 'Equipment', 'Land Purchase', 'Emergency', 'Working Capital', 'Other'];

const initialForm = {
  // Step 1
  full_name: '',
  region: '',
  land_size_acres: '',
  land_ownership: 'owned',
  crop_types: [],
  // Step 2
  annual_income_inr: '',
  income_regularity: 'seasonal',
  off_season_income: '',
  total_savings_inr: '',
  livestock_value_inr: '',
  equipment_value_inr: '',
  vehicle_value_inr: '',
  gold_value_inr: '',
  property_other_inr: '',
  monthly_expenses_inr: '',
  household_size: '',
  // Step 3
  loan_amount: '',
  loan_purpose: '',
  existing_loan_count: '',
  existing_loan_outstanding: '',
  existing_loan_sources: [],
  past_defaults: false,
  irrigation_access: true,
  market_distance_km: '',
  average_yield_quintals_per_acre: '',
};

export default function FarmerForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleArrayField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.region.trim()) e.region = 'Region is required';
      if (!form.land_size_acres || Number(form.land_size_acres) <= 0) e.land_size_acres = 'Enter valid land size';
      if (form.crop_types.length === 0) e.crop_types = 'Select at least one crop';
    } else if (s === 2) {
      if (!form.annual_income_inr || Number(form.annual_income_inr) <= 0) e.annual_income_inr = 'Enter valid income';
      if (!form.monthly_expenses_inr || Number(form.monthly_expenses_inr) <= 0) e.monthly_expenses_inr = 'Enter monthly expenses';
      if (!form.household_size || Number(form.household_size) <= 0) e.household_size = 'Enter household size';
    } else if (s === 3) {
      if (!form.loan_amount || Number(form.loan_amount) <= 0) e.loan_amount = 'Enter loan amount';
      if (!form.loan_purpose) e.loan_purpose = 'Select a purpose';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const prev = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    const payload = {
      region: form.region,
      land_size_acres: Number(form.land_size_acres),
      land_ownership: form.land_ownership,
      crop_types: form.crop_types,
      annual_income_inr: Number(form.annual_income_inr),
      income_regularity: form.income_regularity,
      off_season_income: Number(form.off_season_income) || 0,
      total_savings_inr: Number(form.total_savings_inr) || 0,
      assets: {
        livestock_value_inr: Number(form.livestock_value_inr) || 0,
        equipment_value_inr: Number(form.equipment_value_inr) || 0,
        vehicle_value_inr: Number(form.vehicle_value_inr) || 0,
        gold_value_inr: Number(form.gold_value_inr) || 0,
        property_other_inr: Number(form.property_other_inr) || 0,
      },
      monthly_expenses_inr: Number(form.monthly_expenses_inr),
      household_size: Number(form.household_size),
      loan_amount: Number(form.loan_amount),
      loan_purpose: form.loan_purpose,
      existing_loans: {
        count: Number(form.existing_loan_count) || 0,
        total_outstanding_inr: Number(form.existing_loan_outstanding) || 0,
        sources: form.existing_loan_sources,
      },
      past_defaults: form.past_defaults,
      irrigation_access: form.irrigation_access,
      market_distance_km: Number(form.market_distance_km) || 0,
      average_yield_quintals_per_acre: Number(form.average_yield_quintals_per_acre) || 0,
    };
    if (form.full_name.trim()) payload.full_name = form.full_name.trim();
    onSubmit(payload);
  };

  const FieldError = ({ field }) =>
    errors[field] ? <p className="text-red-500 text-sm mt-1">{errors[field]}</p> : null;

  const progressPercent = ((step - 1) / 2) * 100;

  return (
    <div className="card p-6 sm:p-8 animate-slide-up">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                s < step ? 'bg-brand-600 text-white' :
                s === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' :
                'bg-stone-100 text-stone-400'
              }`}>
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : s}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${s === step ? 'text-brand-700' : 'text-stone-400'}`}>
                {s === 1 ? 'Basic Info' : s === 2 ? 'Income & Assets' : 'Loan Details'}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in" id="form-step-1">
          <h3 className="text-xl font-bold text-stone-900 mb-2">Basic Profile</h3>

          <div>
            <label className="label-text">Full Name <span className="text-stone-400 font-normal">(optional)</span></label>
            <input className="input-field" placeholder="e.g., Ramesh Kumar" value={form.full_name} onChange={e => set('full_name', e.target.value)} id="input-name" />
          </div>

          <div>
            <label className="label-text">Region / District *</label>
            <input className="input-field" placeholder="e.g., Vidarbha, Maharashtra" value={form.region} onChange={e => set('region', e.target.value)} id="input-region" />
            <FieldError field="region" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Land Size (acres) *</label>
              <input type="number" step="0.1" min="0" className="input-field" placeholder="e.g., 2.5" value={form.land_size_acres} onChange={e => set('land_size_acres', e.target.value)} id="input-land-size" />
              <FieldError field="land_size_acres" />
            </div>
            <div>
              <label className="label-text">Land Ownership</label>
              <select className="select-field" value={form.land_ownership} onChange={e => set('land_ownership', e.target.value)} id="select-ownership">
                <option value="owned">Owned</option>
                <option value="leased">Leased</option>
                <option value="shared">Shared</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Crops Grown *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CROP_OPTIONS.map(crop => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleArrayField('crop_types', crop)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    form.crop_types.includes(crop)
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300 hover:text-brand-700'
                  }`}
                  id={`crop-${crop}`}
                >
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </button>
              ))}
            </div>
            <FieldError field="crop_types" />
          </div>
        </div>
      )}

      {/* Step 2: Income & Assets */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in" id="form-step-2">
          <h3 className="text-xl font-bold text-stone-900 mb-2">Income & Assets</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Annual Farm Income (₹) *</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 150000" value={form.annual_income_inr} onChange={e => set('annual_income_inr', e.target.value)} id="input-income" />
              <FieldError field="annual_income_inr" />
            </div>
            <div>
              <label className="label-text">Income Regularity</label>
              <div className="flex gap-2 mt-1.5">
                {['seasonal', 'year-round', 'irregular'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('income_regularity', opt)}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      form.income_regularity === opt
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {form.income_regularity !== 'year-round' && (
            <div>
              <label className="label-text">Off-Season Income (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 20000" value={form.off_season_income} onChange={e => set('off_season_income', e.target.value)} id="input-off-season" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Total Savings (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 25000" value={form.total_savings_inr} onChange={e => set('total_savings_inr', e.target.value)} id="input-savings" />
            </div>
            <div>
              <label className="label-text">Monthly Expenses (₹) *</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 10000" value={form.monthly_expenses_inr} onChange={e => set('monthly_expenses_inr', e.target.value)} id="input-expenses" />
              <FieldError field="monthly_expenses_inr" />
            </div>
          </div>

          <div>
            <label className="label-text">Household Size *</label>
            <input type="number" min="1" className="input-field w-32" placeholder="e.g., 5" value={form.household_size} onChange={e => set('household_size', e.target.value)} id="input-household" />
            <FieldError field="household_size" />
          </div>

          <div>
            <label className="label-text text-stone-500 font-medium mb-3 block">Asset Values (₹) — enter approximate values</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'livestock_value_inr', label: 'Livestock' },
                { key: 'equipment_value_inr', label: 'Farm Equipment' },
                { key: 'vehicle_value_inr', label: 'Vehicles' },
                { key: 'gold_value_inr', label: 'Gold / Jewellery' },
                { key: 'property_other_inr', label: 'Other Property' },
              ].map(asset => (
                <div key={asset.key}>
                  <label className="text-xs text-stone-500 mb-1 block">{asset.label}</label>
                  <input type="number" min="0" className="input-field" placeholder="₹0" value={form[asset.key]} onChange={e => set(asset.key, e.target.value)} id={`input-${asset.key}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Loan Context */}
      {step === 3 && (
        <div className="space-y-5 animate-fade-in" id="form-step-3">
          <h3 className="text-xl font-bold text-stone-900 mb-2">Loan Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Loan Amount Requested (₹) *</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 100000" value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)} id="input-loan-amount" />
              <FieldError field="loan_amount" />
            </div>
            <div>
              <label className="label-text">Purpose *</label>
              <select className="select-field" value={form.loan_purpose} onChange={e => set('loan_purpose', e.target.value)} id="select-purpose">
                <option value="">Select purpose...</option>
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <FieldError field="loan_purpose" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Existing Loans Count</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 1" value={form.existing_loan_count} onChange={e => set('existing_loan_count', e.target.value)} id="input-loan-count" />
            </div>
            <div>
              <label className="label-text">Total Outstanding Loans (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 50000" value={form.existing_loan_outstanding} onChange={e => set('existing_loan_outstanding', e.target.value)} id="input-loan-outstanding" />
            </div>
          </div>

          <div>
            <label className="label-text">Existing Loan Sources</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {LOAN_SOURCES.map(src => (
                <button
                  key={src}
                  type="button"
                  onClick={() => toggleArrayField('existing_loan_sources', src)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    form.existing_loan_sources.includes(src)
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'
                  }`}
                >
                  {src.charAt(0).toUpperCase() + src.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
              <label className="label-text mb-0 flex-1">Past Loan Defaults?</label>
              <button
                type="button"
                onClick={() => set('past_defaults', !form.past_defaults)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${form.past_defaults ? 'bg-red-500' : 'bg-stone-300'}`}
                id="toggle-defaults"
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${form.past_defaults ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
              <label className="label-text mb-0 flex-1">Irrigation Access?</label>
              <button
                type="button"
                onClick={() => set('irrigation_access', !form.irrigation_access)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${form.irrigation_access ? 'bg-brand-500' : 'bg-stone-300'}`}
                id="toggle-irrigation"
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${form.irrigation_access ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Distance to Nearest Market (km)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g., 15" value={form.market_distance_km} onChange={e => set('market_distance_km', e.target.value)} id="input-market-dist" />
            </div>
            <div>
              <label className="label-text">Avg Crop Yield (quintals/acre)</label>
              <input type="number" min="0" step="0.1" className="input-field" placeholder="e.g., 5.5" value={form.average_yield_quintals_per_acre} onChange={e => set('average_yield_quintals_per_acre', e.target.value)} id="input-yield" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
        {step > 1 ? (
          <button onClick={prev} className="btn-ghost" id="btn-prev">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        ) : <div />}

        {step < 3 ? (
          <button onClick={next} className="btn-primary" id="btn-next">
            Next
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="btn-primary" id="btn-submit">
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI is analyzing...
              </>
            ) : (
              <>
                Get My Fair Rate
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
