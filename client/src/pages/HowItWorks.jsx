import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'problem',
    icon: '🚨',
    title: 'The Problem with Traditional Loan Assessment',
    content: [
      'Traditional agricultural lending in India is deeply unfair. Banks use rigid national criteria — credit scores, land titles, collateral requirements — that systematically exclude small and marginal farmers.',
      'A subsistence farmer in Bihar with 1 acre and ₹40,000 annual income gets rejected by banks. Their only option? Moneylenders charging 24–36% interest, trapping them in debt cycles.',
      'Meanwhile, a large landowner in Punjab with 20 acres sails through bank approval at 9% interest. The system rewards existing wealth and punishes poverty.',
      'The core problem: a farmer is evaluated against national standards rather than their local economic reality. A "poor" farmer by national standards might actually be in the middle of their village\'s wealth distribution — and perfectly capable of repaying a small loan.',
    ],
  },
  {
    id: 'crowdsource',
    icon: '🤝',
    title: 'How Crowd-Sourcing Builds Fair Benchmarks',
    content: [
      'FairLoan AI uses community-contributed economic profiles to build a real picture of local economies. Every farmer who submits their anonymous data makes the system smarter and fairer.',
      'When enough farmers from a region contribute, we can calculate: What does "wealthy" actually mean in Vidarbha vs Punjab? What is the median income? What are typical asset values?',
      'This local benchmarking is the key innovation. Instead of comparing a Vidarbha cotton farmer to a Punjab wheat magnate, we compare them to other Vidarbha cotton farmers.',
      'More data = better fairness. That\'s why we encourage everyone to contribute — even if you\'re not seeking a loan. Your anonymous profile helps calibrate fair rates for your neighbours.',
    ],
  },
  {
    id: 'calculation',
    icon: '🧮',
    title: 'How the AI Calculates Your Rate',
    steps: [
      {
        step: 1,
        title: 'Wealth Score Calculation',
        desc: 'We calculate a composite wealth score: (land × ₹50,000) + annual income + savings + all asset values − (outstanding loans × 0.8). This gives a single number representing your economic standing.',
      },
      {
        step: 2,
        title: 'Community Percentile',
        desc: 'Your wealth score is ranked against all community profiles from your region. If you\'re at the 15th percentile, it means 85% of farmers in your area have more wealth than you.',
      },
      {
        step: 3,
        title: 'Bias Filtering',
        desc: 'We strip your name, self-reported wealth tier, and exact location. We add flags for structural disadvantages: moneylender dependency (not your fault — a sign of exclusion) and rural remoteness (not a risk — just geography).',
      },
      {
        step: 4,
        title: 'AI Assessment',
        desc: 'Google\'s Gemini AI receives your anonymised profile with your community percentile. It\'s instructed: "A farmer at the 10th percentile gets the lowest rates. A farmer at the 90th percentile gets standard rates." The AI cannot penalise you for being in a poor region.',
      },
      {
        step: 5,
        title: 'Fair Results',
        desc: 'You receive your interest rate (4–18%), collateral requirements, repayment schedule, and a fairness explanation. Every recommendation shows exactly WHY you got these terms.',
      },
    ],
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: 'Privacy: What Data Is and Isn\'t Stored',
    lists: {
      stored: [
        'Region/district (e.g., "Vidarbha, Maharashtra" — not your village)',
        'Land size and ownership type',
        'Crop types and yield data',
        'Income, savings, and asset values (aggregated)',
        'Household size and monthly expenses',
        'Existing loan information (aggregated)',
      ],
      notStored: [
        'Your name or any identifying information',
        'Phone number, Aadhaar, or bank details',
        'Exact GPS coordinates or village name',
        'Your loan profile results (only calculated, never saved)',
        'Any data sent to the AI includes no personal identifiers',
      ],
    },
  },
];

export default function HowItWorks() {
  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="section-title">How FairLoan AI Works</h1>
          <p className="section-subtitle">
            Transparent, unbiased agricultural lending — explained step by step.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} className="card p-6 sm:p-8 animate-slide-up" id={`section-${section.id}`}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{section.icon}</span>
                <h2 className="text-xl font-bold text-stone-900">{section.title}</h2>
              </div>

              {section.content && (
                <div className="space-y-4">
                  {section.content.map((para, i) => (
                    <p key={i} className="text-stone-600 leading-relaxed">{para}</p>
                  ))}
                </div>
              )}

              {section.steps && (
                <div className="space-y-6">
                  {section.steps.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center font-bold text-lg">
                        {s.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-900 mb-1">{s.title}</h3>
                        <p className="text-stone-600 text-[15px] leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.lists && (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-brand-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                      </svg>
                      What We Store (Anonymised)
                    </h3>
                    <ul className="space-y-2">
                      {section.lists.stored.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                          <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      What We NEVER Store
                    </h3>
                    <ul className="space-y-2">
                      {section.lists.notStored.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/get-profile" className="btn-primary text-lg px-8 py-4" id="hiw-cta">
            Try It Now — Get Your Fair Rate
          </Link>
        </div>
      </div>
    </div>
  );
}
