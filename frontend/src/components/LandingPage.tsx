import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import PublicHeader from './PublicHeader';

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

const featureSlides = [
  {
    eyebrow: 'Plain-language summaries',
    title: 'Turn medical jargon into clear next steps',
    description:
      'MedBridge explains diagnoses, results, and clinical notes in language that is easy to understand and easier to act on.',
    points: ['Simple explanations', 'Actionable follow-up guidance', 'Built for patients and caregivers'],
  },
  {
    eyebrow: 'Document coverage',
    title: 'Works across labs, reports, and clinical documents',
    description:
      'Upload a wide range of document types and get a consistent summary that highlights the important details first.',
    points: ['Blood work and panels', 'Radiology and pathology', 'Visit notes and discharge summaries'],
  },
  {
    eyebrow: 'Secure workflow',
    title: 'Review private health information with confidence',
    description:
      'The experience is designed to be fast, understandable, and secure from upload through results.',
    points: ['Fast processing', 'Clear result layout', 'Secure document handling'],
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const onGetStarted = () => navigate('/upload');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featureSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = featureSlides[activeSlide];

  return (
    <main>
      <PublicHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#2E7D55] via-[#3B8F67] to-[#66B48B] px-6 py-20 text-white sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#D4A843]/10" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#D4A843]" />
            AI-Powered Medical Document Analysis
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 text-left shadow-2xl shadow-black/10 backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  {currentSlide.eyebrow}
                </p>
                <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                  {currentSlide.title}
                </h1>
              </div>

              <div className="hidden shrink-0 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 md:block">
                Slide {activeSlide + 1}/{featureSlides.length}
              </div>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                  {currentSlide.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {currentSlide.points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-[#1E3A2F]/25 p-5 shadow-inner shadow-black/10">
                <div className="grid gap-3">
                  <div className="rounded-xl bg-white/10 px-4 py-3 text-white/90">
                    Upload a report, scan, or lab result.
                  </div>
                  <div className="rounded-xl bg-[#D4A843]/15 px-4 py-3 text-white/90">
                    MedBridge highlights the key findings.
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-3 text-white/90">
                    Get a plain-language explanation and next steps.
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {featureSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        onClick={() => setActiveSlide(index)}
                        className={`h-2.5 rounded-full transition-all duration-200 ${
                          index === activeSlide ? 'w-8 bg-[#D4A843]' : 'w-2.5 bg-white/35 hover:bg-white/55'
                        }`}
                        aria-label={`Show slide ${index + 1}`}
                        aria-pressed={index === activeSlide}
                      />
                    ))}
                  </div>

                  <button
                    onClick={onGetStarted}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    Upload now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8 px-6 py-5">
          {[
            { icon: '📑', label: '10+ Document Types' },
            { icon: '🔒', label: 'Secure Processing' },
            { icon: '⚡', label: 'Results in Seconds' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="text-base">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F2F7F4] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-2 text-2xl font-bold text-[#1E3A2F]">Works With Any Medical Document</h2>
          <p className="mb-8 text-gray-500">Paste the text or upload a file — we handle the rest.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {docTypes.map((type) => (
              <span
                key={type}
                className="rounded-full border border-[#8FD4A8] bg-white px-4 py-2 text-sm font-medium text-[#1E3A2F] shadow-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#245A42] px-6 py-8 text-white/60">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-sm font-semibold text-white/80">MedBridgeA</span>
          </div>
          <p className="max-w-md text-center text-xs md:text-right">
            © 2026 MedBridgeA. For informational purposes only. Always consult a qualified
            healthcare provider before making any health decisions.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
