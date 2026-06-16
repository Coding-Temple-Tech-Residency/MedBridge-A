import Logo from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const docTypes = [
  'Lab Reports',
  'Blood Tests',
  'Metabolic Panels',
  'Lipid Panels',
  'Pathology Reports',
  'Discharge Summaries',
  'Prescriptions',
  'Radiology Reports',
  'Genetic Reports',
  'Clinical Notes',
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#2E7D55] via-[#3B8F67] to-[#66B48B] text-white py-28 px-6 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#D4A843]/10 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/90 mb-7">
            <span className="w-2 h-2 rounded-full bg-[#D4A843] inline-block animate-pulse" />
            AI-Powered Medical Document Analysis
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-white">
            Your Health Records, <span className="text-[#D4A843]">Finally Explained</span>
          </h1>

          <p className="text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any medical document and receive clear plain-language explanations, personalised
            health summaries, and actionable next steps — all powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-[#D4A843] hover:bg-[#c49630] text-[#1E3A2F] font-bold py-4 px-9 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Analyze a Document — Free
            </button>
            <button
              onClick={onGetStarted}
              className="border-2 border-white/30 hover:border-white/60 text-white font-semibold py-4 px-9 rounded-xl text-lg transition-all duration-200 hover:bg-white/10"
            >
              Upload Document
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8">
          {[
            { icon: '📑', label: '10+ Document Types' },
            { icon: '🔒', label: 'Secure Processing' },
            { icon: '⚡', label: 'Results in Seconds' },
            { icon: '🆓', label: 'Free to Try' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm font-medium text-gray-600"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported document types ── */}
      <section className="py-16 px-6 bg-[#F2F7F4]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1E3A2F] mb-2">
            Works With Any Medical Document
          </h2>
          <p className="text-gray-500 mb-8">
            Paste the text or upload a file — we handle the rest.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {docTypes.map((type) => (
              <span
                key={type}
                className="bg-white border border-[#8FD4A8] text-[#1E3A2F] px-4 py-2 rounded-full text-sm font-medium shadow-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-20 px-6 bg-[#2C6E51] text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Understand Your Health?</h2>
          <p className="text-white/70 text-lg mb-8">
            Start analysing your medical documents today.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-[#D4A843] hover:bg-[#c49630] text-[#1E3A2F] font-bold py-4 px-10 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Analysing — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#245A42] text-white/60 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-white/80 font-semibold text-sm">MedBridgeA</span>
          </div>
          <p className="text-xs text-center md:text-right max-w-md">
            © 2026 MedBridgeA. For informational purposes only. Always consult a qualified
            healthcare provider before making any health decisions.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
