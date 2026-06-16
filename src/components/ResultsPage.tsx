import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockAnalysisResult } from '../mockData';
import type { HealthMetric, ActionableStep } from '../types';

interface ResultsPageProps {
  onNewDocument: () => void;
}

// ── Metric range bar ─────────────────────────────────────────────────────────
const MetricRangeBar: React.FC<{ metric: HealthMetric }> = ({ metric }) => {
  const buffer = (metric.normalMax - metric.normalMin) * 0.45;
  const rangeMin = Math.max(0, metric.normalMin - buffer);
  const rangeMax = metric.normalMax + buffer;
  const total = rangeMax - rangeMin;

  const normalStartPct = ((metric.normalMin - rangeMin) / total) * 100;
  const normalWidthPct = ((metric.normalMax - metric.normalMin) / total) * 100;
  const valuePct = Math.max(1, Math.min(99, ((metric.value - rangeMin) / total) * 100));

  const dotColor =
    metric.status === 'elevated'
      ? 'bg-[#D4A843]'
      : metric.status === 'low'
        ? 'bg-blue-400'
        : 'bg-[#2E7D55]';

  return (
    <div className="relative h-2.5 bg-gray-100 rounded-full mt-2.5 mb-1">
      {/* Normal range band */}
      <div
        className="absolute h-full bg-[#8FD4A8] rounded-full opacity-50"
        style={{ left: `${normalStartPct}%`, width: `${normalWidthPct}%` }}
      />
      {/* Value marker dot */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 ${dotColor}`}
        style={{ left: `${valuePct}%` }}
      />
    </div>
  );
};

// ── Priority badge ────────────────────────────────────────────────────────────
const PriorityBadge: React.FC<{ priority: ActionableStep['priority'] }> = ({ priority }) => {
  const styles = {
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-[#F2F7F4] text-[#2E7D55] border-[#8FD4A8]',
    low: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  const labels = { high: 'Priority', medium: 'Recommended', low: 'Ongoing' };

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ResultsPage: React.FC<ResultsPageProps> = ({ onNewDocument }) => {
  const result = mockAnalysisResult;

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const statusBanner = {
    normal: {
      bar: 'bg-green-50 border-green-200',
      icon: '✓',
      iconBg: 'bg-green-100 text-green-700',
      text: 'text-green-700',
      label: 'All Clear',
    },
    'mostly-normal': {
      bar: 'bg-amber-50 border-amber-200',
      icon: '⚠',
      iconBg: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
      label: 'Mostly Normal',
    },
    'attention-needed': {
      bar: 'bg-red-50 border-red-200',
      icon: '!',
      iconBg: 'bg-red-100 text-red-700',
      text: 'text-red-700',
      label: 'Attention Needed',
    },
  }[result.overallStatus];

  return (
    <div className="min-h-screen bg-[#F2F7F4] pb-20">
      {/* ── Summary banner ── */}
      <div className={`${statusBanner.bar} border-b py-5 px-6`}>
        <div className="max-w-3xl mx-auto flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg mt-0.5 ${statusBanner.iconBg}`}
          >
            {statusBanner.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
              <span className={`text-xs font-bold uppercase tracking-widest ${statusBanner.text}`}>
                {statusBanner.label}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{result.reportType}</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{result.date}</span>
            </div>
            <p className={`font-medium ${statusBanner.text}`}>{result.overallMessage}</p>
          </div>
        </div>
      </div>

      {/* ── Sticky section nav ── */}
      <div className="sticky top-[61px] z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-2.5 flex gap-1">
          {[
            { id: 'explanation', label: '📋 Explanation' },
            { id: 'metrics', label: '📊 Health Metrics' },
            { id: 'steps', label: '✅ Next Steps' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-[#1E3A2F] hover:bg-[#F2F7F4] transition-colors"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-6 pt-10 space-y-14">
        {/* ── Section 1: Plain language explanation ── */}
        <section id="explanation" className="scroll-mt-28">
          <h2 className="text-2xl font-bold text-[#1E3A2F] mb-1">Plain Language Explanation</h2>
          <p className="text-gray-400 text-sm mb-6">
            What your results actually mean — in plain English.
          </p>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-5">
            <p className="text-gray-600 leading-relaxed">{result.explanation.summary}</p>
          </div>

          {/* Per-finding cards */}
          <div className="space-y-4">
            {result.explanation.sections.map((section) => (
              <div
                key={section.title}
                className={`bg-white rounded-2xl p-5 border shadow-sm ${
                  section.status === 'elevated'
                    ? 'border-amber-200'
                    : section.status === 'low'
                      ? 'border-blue-200'
                      : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{section.icon}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1E3A2F]">{section.title}</h3>
                      {section.status !== 'normal' && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            section.status === 'elevated'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {section.status === 'elevated' ? '▲ Elevated' : '▼ Low'}
                        </span>
                      )}
                    </div>
                    <p
                      className={`font-medium mb-2 text-sm ${
                        section.status === 'elevated' ? 'text-amber-700' : 'text-[#1E3A2F]'
                      }`}
                    >
                      {section.finding}
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed">{section.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Health metrics ── */}
        <section id="metrics" className="scroll-mt-28">
          <h2 className="text-2xl font-bold text-[#1E3A2F] mb-1">Health Metrics Overview</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your results compared to standard reference ranges.
          </p>

          {/* Radar chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <h3 className="font-semibold text-[#1E3A2F] mb-1">Health Category Scores</h3>
            <p className="text-xs text-gray-400 mb-4">
              AI-estimated scores (0–100) based on how your values compare to reference ranges.
            </p>
            <ResponsiveContainer width="100%" height={310}>
              <RadarChart
                data={result.healthCategories}
                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
              >
                <PolarGrid stroke="#8FD4A8" strokeOpacity={0.4} />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: '#1E3A2F', fontSize: 12, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#2E7D55"
                  fill="#2E7D55"
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [`${value} / 100`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Individual metric cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {result.metrics.map((metric) => (
              <div
                key={metric.name}
                className={`bg-white rounded-xl p-4 border shadow-sm ${
                  metric.status === 'elevated'
                    ? 'border-amber-200'
                    : metric.status === 'low'
                      ? 'border-blue-200'
                      : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#1E3A2F] text-sm">{metric.name}</p>
                    <p className="text-xs text-gray-400">{metric.description}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xl font-bold ${
                        metric.status === 'elevated'
                          ? 'text-[#D4A843]'
                          : metric.status === 'low'
                            ? 'text-blue-500'
                            : 'text-[#2E7D55]'
                      }`}
                    >
                      {metric.value}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{metric.unit}</span>
                  </div>
                </div>
                <MetricRangeBar metric={metric} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-300">{metric.normalMin}</span>
                  <span className="text-xs text-gray-400">
                    Normal: {metric.normalMin}–{metric.normalMax} {metric.unit}
                  </span>
                  <span className="text-xs text-gray-300">{metric.normalMax}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-5 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2E7D55] inline-block" /> Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D4A843] inline-block" /> Elevated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> Low
            </span>
          </div>
        </section>

        {/* ── Section 3: Actionable next steps ── */}
        <section id="steps" className="scroll-mt-28">
          <h2 className="text-2xl font-bold text-[#1E3A2F] mb-1">Your Action Plan</h2>
          <p className="text-gray-400 text-sm mb-6">
            Personalised steps based on your results. Always confirm major decisions with your
            healthcare provider.
          </p>

          <div className="space-y-4">
            {result.steps.map((step, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-5 border shadow-sm ${
                  step.priority === 'high'
                    ? 'border-amber-200'
                    : step.priority === 'medium'
                      ? 'border-[#8FD4A8]'
                      : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{step.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1E3A2F]">{step.title}</h3>
                      <PriorityBadge priority={step.priority} />
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-2">{step.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span>⏱</span>
                      <span>{step.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
            <strong className="text-gray-600">⚕️ Medical Disclaimer: </strong>
            This analysis is for informational purposes only and does not constitute medical advice.
            Always consult with a qualified healthcare professional before making any health
            decisions.
          </div>
        </section>

        {/* ── Analyse another ── */}
        <div className="text-center border-t border-gray-200 pt-10">
          <p className="text-gray-400 mb-4 text-sm">Have another document to analyse?</p>
          <button
            onClick={onNewDocument}
            className="bg-[#1E3A2F] hover:bg-[#2E7D55] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Analyse Another Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
