/**
 * TraditionalComparison — Side-by-side comparison showing how a traditional
 * bank scoring model would assess this farmer vs how FairLoan AI assesses them.
 *
 * Uses hardcoded rejection rules (no API call) to simulate traditional banking:
 * - Rejected if income < ₹1,50,000 OR land < 2 acres OR land not owned
 * - Otherwise: 14% + random jitter between -1% and +2%
 */
import { useMemo } from 'react';

export default function TraditionalComparison({ profile, wealthContext, applicantData, loanAmount }) {
  const fairRate = profile.interest_rate_annual_percent;
  const percentile = wealthContext.wealth_percentile;

  // Extract applicant fields (with fallbacks)
  const income = applicantData?.annual_income_inr || 0;
  const land = applicantData?.land_size_acres || 0;
  const ownership = applicantData?.land_ownership || 'unknown';
  const requestedAmount = Number(loanAmount) || 0;

  // --- Traditional Bank Model (hardcoded rules) ---
  const traditional = useMemo(() => {
    const isRejected = income < 150000 || land < 2 || ownership !== 'owned';

    if (isRejected) {
      // Build specific rejection reason
      const reasons = [];
      if (income < 150000) reasons.push(`income ₹${income.toLocaleString('en-IN')} is below ₹1,50,000 minimum`);
      if (land < 2) reasons.push(`land ${land} acres is below 2-acre minimum`);
      if (ownership !== 'owned') reasons.push(`land is ${ownership}, not owned — no collateral`);

      return {
        eligible: false,
        verdict: 'REJECTED',
        rate: null,
        reason: `Rejected — Insufficient collateral: ${reasons.join('; ')}.`,
      };
    }

    // Approved with jitter: 14% + random between -1 and +2
    // Use a seeded-ish jitter based on income+land so it's stable per profile
    const jitterSeed = (income * 7 + land * 13) % 100;
    const jitter = -1 + (jitterSeed / 100) * 3; // range: -1 to +2
    const rate = Math.round((14 + jitter) * 10) / 10;

    return {
      eligible: true,
      verdict: 'APPROVED',
      rate,
      reason: `Standard KCC terms — ${rate}% based on national income benchmark and collateral assessment.`,
    };
  }, [income, land, ownership]);

  // Savings calculation
  const savingsPerYear = traditional.eligible && requestedAmount > 0
    ? Math.round(requestedAmount * (traditional.rate - fairRate) / 100)
    : requestedAmount > 0
      ? Math.round(requestedAmount * (14 - fairRate) / 100) // Compare against 14% base if rejected
      : 0;

  // Determine the fairness insight
  let insight;
  if (!traditional.eligible) {
    insight = `This farmer would be completely shut out by a traditional bank. But in their community, they rank at the ${percentile}th percentile — meaning they're ${percentile > 50 ? 'wealthier than most of their peers' : 'building economic capacity'}. FairLoan sees this context.`;
  } else if (fairRate < traditional.rate) {
    const diff = (traditional.rate - fairRate).toFixed(1);
    insight = `A traditional bank would charge ${diff}% more in interest. FairLoan's community-relative model recognizes that this farmer stands at the ${percentile}th percentile locally, and adjusts terms accordingly.`;
  } else {
    insight = `This farmer's income is strong even by national standards. Both models offer competitive rates, but FairLoan additionally considers community context and fairness metrics.`;
  }

  return (
    <div className="card p-6 border-2 border-dashed border-stone-200" id="traditional-comparison">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
        <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Traditional Bank vs FairLoan AI</h4>
      </div>
      <p className="text-xs text-stone-400 mb-5">What would happen if this farmer walked into a traditional bank?</p>

      {/* Side by Side Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Traditional Bank */}
        <div className={`p-4 rounded-xl border-2 ${traditional.eligible ? 'border-red-200 bg-red-50/50' : 'border-red-300 bg-red-100/60'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-red-500 font-semibold uppercase">Traditional Bank</p>
              <p className="text-[10px] text-red-400">National benchmark scoring</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-stone-500">Verdict</span>
              <span className={`font-bold text-sm ${traditional.eligible ? 'text-amber-700' : 'text-red-700'}`}>
                {traditional.verdict}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-stone-500">Interest Rate</span>
              <span className="font-bold text-lg text-red-700">
                {traditional.eligible ? `${traditional.rate}%` : '—'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 pt-1 border-t border-red-200">{traditional.reason}</p>
          </div>
        </div>

        {/* FairLoan AI */}
        <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase">FairLoan AI</p>
              <p className="text-[10px] text-emerald-500">Community-relative scoring</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-stone-500">Verdict</span>
              <span className="font-bold text-sm text-emerald-700">APPROVED</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-stone-500">Interest Rate</span>
              <span className="font-bold text-lg text-emerald-700">{fairRate}%</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-1 border-t border-emerald-200">
              {percentile}th percentile in community — {wealthContext.relative_wealth_label}
            </p>
          </div>
        </div>
      </div>

      {/* Savings Calculation */}
      {savingsPerYear > 0 && requestedAmount > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                FairLoan saves you ₹{savingsPerYear.toLocaleString('en-IN')} per year
              </p>
              <p className="text-xs text-emerald-700">
                in interest on your ₹{requestedAmount.toLocaleString('en-IN')} loan amount
                {!traditional.eligible && ' (compared to standard 14% bank rate)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          <p className="text-xs text-indigo-700 leading-relaxed">{insight}</p>
        </div>
      </div>

      {/* Source footnote */}
      <p className="text-[10px] text-stone-400 mt-3">
        Traditional bank simulation based on standard KCC eligibility criteria: minimum ₹1,50,000 income, 2 acres owned land, and collateral requirements.
      </p>
    </div>
  );
}
