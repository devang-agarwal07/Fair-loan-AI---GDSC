import { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const ACCEPTED_FORMATS = '.jpg,.jpeg,.png,.webp,.pdf';
const MAX_FILE_SIZE_MB = 10;

/**
 * DataQualityAppeal — Shown when a data submission is rejected (422).
 * Gives the user two options:
 * 1. Go back and edit their data
 * 2. Upload a government document as proof for AI verification
 */
export default function DataQualityAppeal({ rejectionData, formData, onRetry, onSuccess }) {
  const [mode, setMode] = useState('choice'); // 'choice' | 'upload' | 'verifying' | 'result'
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setError('');
    setSelectedFile(file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setMode('verifying');
    setError('');

    try {
      const formPayload = new FormData();
      formPayload.append('document', selectedFile);
      formPayload.append('formData', JSON.stringify(formData));
      formPayload.append('rejectionReasons', JSON.stringify(rejectionData.reasons || []));

      const res = await fetch(`${API_URL}/api/dataset/appeal`, {
        method: 'POST',
        body: formPayload,
      });

      const data = await res.json();

      setResult(data);
      setMode('result');

      if (data.success && data.verdict === 'APPROVED' && onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setError('Failed to connect to the verification server. Please try again.');
      setMode('upload');
    }
  };

  // --- CHOICE VIEW: Show rejection + two options ---
  if (mode === 'choice') {
    return (
      <div className="card p-6 border-2 border-red-200 bg-red-50/30 animate-scale-in" id="quality-appeal">
        {/* Rejection Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-red-800 text-lg">Data Quality Check Failed</h3>
            <p className="text-sm text-red-600 mt-1">Your submission was flagged for the following reasons:</p>
          </div>
        </div>

        {/* Rejection Reasons */}
        <div className="space-y-2 mb-6 ml-[52px]">
          {(rejectionData.reasons || []).map((reason, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-red-100/60 rounded-lg">
              <span className="text-red-500 font-bold text-sm mt-0.5">{i + 1}.</span>
              <p className="text-sm text-red-800">{reason}</p>
            </div>
          ))}
        </div>

        {/* Two Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-[52px]">
          {/* Option 1: Edit */}
          <button
            onClick={onRetry}
            className="p-4 bg-white rounded-xl border-2 border-stone-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all duration-200 text-left group"
            id="btn-retry-form"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <h4 className="font-semibold text-stone-800">Edit & Resubmit</h4>
            </div>
            <p className="text-xs text-stone-500">Go back and correct the values you entered</p>
          </button>

          {/* Option 2: Upload Proof */}
          <button
            onClick={() => setMode('upload')}
            className="p-4 bg-white rounded-xl border-2 border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 text-left group"
            id="btn-upload-proof"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <h4 className="font-semibold text-stone-800">Upload Proof</h4>
            </div>
            <p className="text-xs text-stone-500">Submit a government document for AI verification</p>
          </button>
        </div>
      </div>
    );
  }

  // --- UPLOAD VIEW: File picker + submit ---
  if (mode === 'upload') {
    return (
      <div className="card p-6 border-2 border-indigo-200 bg-indigo-50/20 animate-scale-in" id="upload-proof-view">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setMode('choice')} className="text-stone-400 hover:text-stone-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h3 className="font-bold text-indigo-800 text-lg">Upload Government Document</h3>
        </div>

        <p className="text-sm text-stone-600 mb-4">
          Upload a government-issued document to verify your data. Our AI will analyze the document and cross-reference it with your submission.
        </p>

        {/* Accepted documents list */}
        <div className="mb-5 p-3 bg-indigo-100/50 rounded-lg">
          <p className="text-xs font-semibold text-indigo-700 mb-2">Accepted Documents:</p>
          <div className="grid grid-cols-2 gap-1">
            {['Land Revenue Record (Khasra)', '7/12 Extract or RoR', 'Income Certificate', 'Kisan Credit Card',
              'Bank Statement', 'Patwari Certificate'].map((doc, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-xs text-indigo-700">{doc}</span>
                </div>
              ))}
          </div>
        </div>

        {/* File Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${selectedFile
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-stone-300 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS}
            onChange={handleFileSelect}
            className="hidden"
            id="document-upload-input"
          />

          {selectedFile ? (
            <div className="space-y-3">
              {preview && (
                <img src={preview} alt="Document preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
              )}
              {!preview && (
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-indigo-700">{selectedFile.name}</p>
                <p className="text-xs text-stone-400">{(selectedFile.size / 1024).toFixed(1)} KB • Click to change</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-stone-500">Click to select a document</p>
              <p className="text-xs text-stone-400">JPG, PNG, or PDF — Max {MAX_FILE_SIZE_MB}MB</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${selectedFile
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          id="btn-verify-document"
        >
          <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          Verify Document with AI
        </button>
      </div>
    );
  }

  // --- VERIFYING VIEW: Loading state ---
  if (mode === 'verifying') {
    return (
      <div className="card p-8 text-center animate-scale-in" id="verification-loading">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-3 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
        </div>
        <h3 className="font-bold text-stone-800 text-lg mb-2">Analyzing Your Document</h3>
        <p className="text-sm text-stone-500 mb-1">Our AI is reading and verifying your document...</p>
        <p className="text-xs text-stone-400">This usually takes 5–10 seconds</p>
      </div>
    );
  }

  // --- RESULT VIEW: Approved or Rejected ---
  if (mode === 'result' && result) {
    const isApproved = result.verdict === 'APPROVED';

    return (
      <div className={`card p-6 border-2 animate-scale-in ${isApproved ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'
        }`} id="verification-result">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isApproved ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
            {isApproved ? (
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285ZM12 15.75h.008v.008H12v-.008Z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isApproved ? 'text-emerald-800' : 'text-red-800'}`}>
              {isApproved ? 'Document Verified — Data Accepted!' : 'Verification Failed'}
            </h3>
            <p className={`text-sm mt-1 ${isApproved ? 'text-emerald-600' : 'text-red-600'}`}>
              {result.verdict_reason || result.message}
            </p>
          </div>
        </div>

        {/* Verification Details */}
        {(result.verification_details || result.details) && (
          <div className="space-y-2 mb-5 ml-[60px]">
            {result.verification_details && (
              <>
                {result.verification_details.document_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400 w-32">Document Type:</span>
                    <span className="font-medium text-stone-700">{result.verification_details.document_type}</span>
                  </div>
                )}
                {result.verification_details.authenticity_score && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400 w-32">Authenticity:</span>
                    <span className="font-medium text-stone-700">{result.verification_details.authenticity_score}/10</span>
                  </div>
                )}
                {result.verification_details.consistency && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-stone-400 w-32 flex-shrink-0">Consistency:</span>
                    <span className="text-stone-600">{result.verification_details.consistency}</span>
                  </div>
                )}
              </>
            )}
            {result.details && (
              <>
                {result.details.document_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400 w-32">Document Type:</span>
                    <span className="font-medium text-stone-700">{result.details.document_type}</span>
                  </div>
                )}
                {result.details.authenticity_score > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400 w-32">Authenticity:</span>
                    <span className="font-medium text-stone-700">{result.details.authenticity_score}/10</span>
                  </div>
                )}
                {result.details.authenticity_flags?.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-stone-400 w-32 flex-shrink-0">Flags:</span>
                    <div className="space-y-1">
                      {result.details.authenticity_flags.map((flag, i) => (
                        <p key={i} className="text-red-600 text-xs">⚠ {flag}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 ml-[60px]">
          {isApproved ? (
            <button onClick={onRetry} className="btn-secondary text-sm" id="btn-submit-another">
              Submit Another Entry
            </button>
          ) : (
            <>
              <button onClick={onRetry} className="btn-primary text-sm" id="btn-edit-and-retry">
                Edit & Resubmit
              </button>
              <button
                onClick={() => { setMode('upload'); setSelectedFile(null); setPreview(null); setResult(null); }}
                className="btn-secondary text-sm"
                id="btn-try-different-doc"
              >
                Try Different Document
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
