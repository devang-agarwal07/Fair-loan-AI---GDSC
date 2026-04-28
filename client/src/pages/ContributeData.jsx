import { useState } from 'react';
import DataQualityAppeal from '../components/DataQualityAppeal';

const CROP_OPTIONS = ['wheat', 'rice', 'cotton', 'sugarcane', 'vegetables', 'pulses', 'other'];

const initialForm = {
  region: '',
  land_size_acres: '',
  land_ownership: 'owned',
  crop_types: [],
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
  existing_loan_count: '',
  existing_loan_outstanding: '',
  past_defaults: false,
  irrigation_access: true,
  market_distance_km: '',
  average_yield_quintals_per_acre: '',
};

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ContributeData() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [datasetSize, setDatasetSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejection, setRejection] = useState(null); // { reasons: [...], formPayload: {...} }

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleCrop = (crop) => {
    setForm(prev => ({
      ...prev,
      crop_types: prev.crop_types.includes(crop)
        ? prev.crop_types.filter(c => c !== crop)
        : [...prev.crop_types, crop],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.region || !form.land_size_acres || !form.annual_income_inr) {
      setError('Please fill in region, land size, and annual income at minimum.');
      return;
    }
    setLoading(true);
    setError('');

    try {
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
        monthly_expenses_inr: Number(form.monthly_expenses_inr) || 0,
        household_size: Number(form.household_size) || 1,
        existing_loans: {
          count: Number(form.existing_loan_count) || 0,
          total_outstanding_inr: Number(form.existing_loan_outstanding) || 0,
          sources: [],
        },
        past_defaults: form.past_defaults,
        irrigation_access: form.irrigation_access,
        market_distance_km: Number(form.market_distance_km) || 0,
        average_yield_quintals_per_acre: Number(form.average_yield_quintals_per_acre) || 0,
      };

      const res = await fetch(`${API_URL}/api/dataset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // Handle data quality rejection (422) — show appeal flow
      if (res.status === 422 && data.reasons) {
        setRejection({ reasons: data.reasons, formPayload: payload });
        setError('');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to submit');

      setDatasetSize(data.dataset_size);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-container animate-scale-in">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Thank You! 🙏</h2>
          <p className="text-stone-600 text-lg mb-2">Your anonymous data has been added to the community dataset.</p>
          <p className="text-stone-500 mb-8">
            The dataset now has <span className="font-bold text-brand-600">{datasetSize}</span> entries, making loan assessments fairer for everyone.
          </p>
          <button onClick={() => { setSubmitted(false); setForm(initialForm); }} className="btn-primary" id="contribute-another">
            Contribute Another Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title">Contribute Your Data</h1>
          <p className="section-subtitle">
            Help make lending fairer for everyone. Your data is anonymous — no names or precise locations are stored.
          </p>
        </div>

        {/* Data Quality Appeal Flow */}
        {rejection && (
          <DataQualityAppeal
            rejectionData={rejection}
            formData={rejection.formPayload}
            onRetry={() => { setRejection(null); setError(''); }}
            onSuccess={(data) => { setDatasetSize(data.dataset_size); setSubmitted(true); setRejection(null); }}
          />
        )}

        {!rejection && (
        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5" id="contribute-form">
          <div>
            <label className="label-text">Region / District *</label>
            <input className="input-field" placeholder="e.g., Vidarbha, Maharashtra" value={form.region} onChange={e => set('region', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Land Size (acres) *</label>
              <input type="number" step="0.1" min="0" className="input-field" value={form.land_size_acres} onChange={e => set('land_size_acres', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Ownership</label>
              <select className="select-field" value={form.land_ownership} onChange={e => set('land_ownership', e.target.value)}>
                <option value="owned">Owned</option>
                <option value="leased">Leased</option>
                <option value="shared">Shared</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Crops</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CROP_OPTIONS.map(crop => (
                <button
                  key={crop} type="button" onClick={() => toggleCrop(crop)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    form.crop_types.includes(crop)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'
                  }`}
                >
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Annual Farm Income (₹) *</label>
              <input type="number" min="0" className="input-field" value={form.annual_income_inr} onChange={e => set('annual_income_inr', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Total Savings (₹)</label>
              <input type="number" min="0" className="input-field" value={form.total_savings_inr} onChange={e => set('total_savings_inr', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Monthly Expenses (₹)</label>
              <input type="number" min="0" className="input-field" value={form.monthly_expenses_inr} onChange={e => set('monthly_expenses_inr', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Household Size</label>
              <input type="number" min="1" className="input-field" value={form.household_size} onChange={e => set('household_size', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Livestock (₹)</label>
              <input type="number" min="0" className="input-field" value={form.livestock_value_inr} onChange={e => set('livestock_value_inr', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Equipment (₹)</label>
              <input type="number" min="0" className="input-field" value={form.equipment_value_inr} onChange={e => set('equipment_value_inr', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Gold (₹)</label>
              <input type="number" min="0" className="input-field" value={form.gold_value_inr} onChange={e => set('gold_value_inr', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-6 py-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-stone-700">Irrigation?</label>
              <button type="button" onClick={() => set('irrigation_access', !form.irrigation_access)}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.irrigation_access ? 'bg-brand-500' : 'bg-stone-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.irrigation_access ? 'translate-x-4' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-stone-700">Past defaults?</label>
              <button type="button" onClick={() => set('past_defaults', !form.past_defaults)}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.past_defaults ? 'bg-red-500' : 'bg-stone-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.past_defaults ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full" id="contribute-submit">
            {loading ? 'Submitting...' : 'Submit Anonymously'}
          </button>

          <p className="text-xs text-stone-400 text-center">
            Your data is completely anonymous. No names, phone numbers, or precise addresses are collected.
          </p>
        </form>
        )}
      </div>
    </div>
  );
}
