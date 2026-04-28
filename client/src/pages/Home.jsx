import { Link } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97Z" />
      </svg>
    ),
    title: 'Fairness-First AI',
    desc: 'Our AI evaluates you relative to your local community — not national standards. Poorer farmers get lower rates.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: 'Crowd-Sourced Data',
    desc: 'Community-contributed economic profiles build fair benchmarks. More data = better accuracy for everyone.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Privacy Protected',
    desc: 'No names or precise locations stored. Your data is anonymised and used only for collective fairness.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: 'Transparent Results',
    desc: 'See exactly why you got your rate. Every recommendation comes with a fairness explanation.',
  },
];

const stats = [
  { value: '4%–18%', label: 'Interest Rate Range' },
  { value: 'AI-Driven', label: 'Bias Removal' },
  { value: '100%', label: 'Transparent' },
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-emerald-50/40 to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-200/30 dark:bg-brand-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-800/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100/80 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              Community-powered fair lending
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
              Fair loans for{' '}
              <span className="gradient-text">every farmer</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
              Our AI removes geographic and social bias from loan assessments. Your interest rate
              is based on where you stand in <em>your</em> community — not where your community stands nationally.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-profile" className="btn-primary text-lg px-8 py-4" id="hero-get-profile">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                </svg>
                Get Your Fair Rate
              </Link>
              <Link to="/how-it-works" className="btn-secondary text-lg px-8 py-4" id="hero-how-it-works">
                Learn How It Works
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-brand-600 dark:text-brand-400">{stat.value}</div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">The Inverse Wealth Principle</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Traditional lending penalises poverty. We invert that — your community context determines your rate.
            </p>
          </div>

          <div className="card p-6 sm:p-10 max-w-3xl mx-auto bg-gradient-to-br from-white to-brand-50/30 dark:from-stone-900 dark:to-brand-950/20">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">Traditional system</p>
                  <p className="text-stone-600 dark:text-stone-400 mt-1">A poor farmer in Bihar pays 24-36% to moneylenders because banks reject them. A wealthy farmer in Punjab gets 9% because they already have assets. The rich get richer.</p>
                </div>
              </div>
              <div className="border-t border-stone-200 dark:border-stone-700" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">FairLoan AI system</p>
                  <p className="text-stone-600 dark:text-stone-400 mt-1">That same poor farmer, sitting at the 15th percentile in their community, gets a 5% rate and minimal collateral. The wealthy Punjab farmer, at the 90th percentile, pays 14%. <strong className="text-brand-700 dark:text-brand-400">Economic justice.</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-stone-900/50 border-y border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">How FairLoan Works</h2>
            <p className="section-subtitle">Four pillars of unbiased agricultural lending</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-hover p-6">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">{f.title}</h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-br from-brand-600 to-brand-800 p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Help Make Lending Fairer</h2>
              <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
                Contribute your anonymous economic profile. Every submission makes the AI more accurate and fair for the next farmer.
              </p>
              <Link to="/contribute" className="inline-flex items-center px-8 py-4 bg-white text-brand-700 font-bold rounded-xl text-lg hover:bg-brand-50 transition-all duration-200 shadow-lg" id="cta-contribute">
                Contribute Your Data
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
