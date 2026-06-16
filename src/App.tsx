import { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import UploadPage from './components/UploadPage';
import ResultsPage from './components/ResultsPage';
import type { View } from './types';

// ── Full-screen analysing overlay ────────────────────────────────────────────
const ANALYSIS_STEPS = [
  'Reading document structure...',
  'Identifying medical terms and values...',
  'Comparing results against reference ranges...',
  'Generating plain-language explanations...',
  'Creating your personalised action plan...',
] as const;

const AnalysingScreen: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1));
    }, 580);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F7F4] flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        {/* Spinner with emoji */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[#8FD4A8]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2E7D55] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🧬</div>
        </div>

        <h2 className="text-2xl font-bold text-[#1E3A2F] mb-2">Analysing Your Document</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Our AI is reviewing your medical document and generating your personalised health
          summary...
        </p>

        {/* Step progress */}
        <div className="text-left space-y-3">
          {ANALYSIS_STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-400 ${
                i < step ? 'opacity-40' : i === step ? 'opacity-100' : 'opacity-20'
              }`}
            >
              {i < step ? (
                <span className="w-5 h-5 rounded-full bg-[#2E7D55] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              ) : i === step ? (
                <span className="w-5 h-5 rounded-full border-2 border-[#2E7D55] flex-shrink-0 animate-pulse" />
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${i === step ? 'text-[#1E3A2F] font-medium' : 'text-gray-400'}`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState<View>('login');
  const [isAnalysing, setIsAnalysing] = useState(false);

  const handleAnalyse = () => {
    setIsAnalysing(true);
    setTimeout(() => {
      setIsAnalysing(false);
      setView('results');
    }, 3200);
  };

  const handleLogin = () => setView('landing');
  const goHome = () => setView('landing');
  const goUpload = () => setView('upload');
  const handleLogout = () => setView('login');

  if (isAnalysing) return <AnalysingScreen />;

  if (view === 'login') return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen">
      <Header
        onLogoClick={goHome}
        currentView={view}
        onGetStarted={view === 'landing' ? goUpload : undefined}
        onLogout={handleLogout}
      />
      {view === 'landing' && <LandingPage onGetStarted={goUpload} />}
      {view === 'upload' && <UploadPage onAnalyze={handleAnalyse} />}
      {view === 'results' && <ResultsPage onNewDocument={goUpload} />}
    </div>
  );
}

export default App;
