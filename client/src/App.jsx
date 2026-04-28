import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GetLoanProfile from './pages/GetLoanProfile';
import ContributeData from './pages/ContributeData';
import ExploreDataset from './pages/ExploreDataset';
import HowItWorks from './pages/HowItWorks';
import BiasAudit from './pages/BiasAudit';
import BiasSimulator from './pages/BiasSimulator';

function App() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/get-profile" element={<GetLoanProfile />} />
          <Route path="/contribute" element={<ContributeData />} />
          <Route path="/explore" element={<ExploreDataset />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/bias-audit" element={<BiasAudit />} />
          <Route path="/simulator" element={<BiasSimulator />} />
        </Routes>
      </main>
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 mt-16 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FL</span>
              </div>
              <span className="font-semibold text-stone-700 dark:text-stone-300">FairLoan AI</span>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 text-center">
              Open-source fair lending. Built with community data and AI for economic justice.
            </p>
            <p className="text-sm text-stone-400 dark:text-stone-500">© 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
