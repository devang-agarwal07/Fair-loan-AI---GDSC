import { useState } from 'react';
import FarmerForm from '../components/FarmerForm';
import CSVUploader from '../components/CSVUploader';
import LoanProfileCard from '../components/LoanProfileCard';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function GetLoanProfile() {
  const [mode, setMode] = useState('form'); // 'form' | 'csv'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submittedLoanAmount, setSubmittedLoanAmount] = useState(0);
  const [submittedPayload, setSubmittedPayload] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError('');
    setResult(null);
    setSubmittedLoanAmount(payload.loan_amount || 0);
    setSubmittedPayload(payload);

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate profile');
      }

      setResult(data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('loan-profile-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Get Your Fair Loan Profile</h1>
          <p className="section-subtitle">
            Fill in your details and our AI will calculate fair interest rates based on your local economic standing.
          </p>
        </div>

        {/* Mode Toggle */}
        {!result && (
          <div className="flex gap-2 mb-6" id="input-mode-toggle">
            <button
              onClick={() => setMode('form')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === 'form'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              Fill Form
            </button>
            <button
              onClick={() => setMode('csv')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === 'csv'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Upload CSV
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-scale-in" id="profile-error">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="font-semibold">Error generating profile</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form / CSV input */}
        {!result && (
          mode === 'form'
            ? <FarmerForm onSubmit={handleSubmit} loading={loading} />
            : <CSVUploader onSubmit={handleSubmit} loading={loading} />
        )}

        {/* Results */}
        {result && (
          <div>
            <button
              onClick={() => { setResult(null); setError(''); }}
              className="btn-ghost mb-4"
              id="btn-new-profile"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              New Profile
            </button>
            <LoanProfileCard
              profile={result.loan_profile}
              wealthContext={result.wealth_context}
              loanAmount={submittedLoanAmount}
              applicantData={submittedPayload}
            />
          </div>
        )}
      </div>
    </div>
  );
}
