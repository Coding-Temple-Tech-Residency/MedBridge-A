import type { AISummaryPayload } from '../../types';

type AISummaryCardProps = {
  payload?: AISummaryPayload | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  className?: string;
};

function toCleanList(values: string[] | null | undefined): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function normaliseSummary(payload: AISummaryPayload) {
  const summary = (payload.summary ?? payload.overall_summary ?? '').trim();
  const keyPoints = toCleanList(payload.keyPoints ?? payload.key_points);
  const recommendations = toCleanList(payload.recommendations ?? payload.next_steps);
  const generatedAt = (payload.generatedAt ?? payload.generated_at ?? '').trim();

  return {
    summary,
    keyPoints,
    recommendations,
    generatedAt,
  };
}

const AISummaryCard: React.FC<AISummaryCardProps> = ({
  payload,
  isLoading = false,
  errorMessage = null,
  className = '',
}) => {
  const safePayload = payload ?? {};
  const { summary, keyPoints, recommendations, generatedAt } = normaliseSummary(safePayload);
  const hasSummary = summary.length > 0;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 bg-[#F2F7F4]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-full bg-[#8FD4A8] text-[#1E3A2F] text-sm font-bold flex items-center justify-center">
              AI
            </span>
            <div>
              <h3 className="text-[#1E3A2F] font-semibold leading-tight">AI Summary</h3>
              <p className="text-xs text-gray-500">Plain-language overview of your document</p>
            </div>
          </div>
          {!isLoading && !errorMessage && generatedAt && (
            <span className="text-xs text-gray-400 whitespace-nowrap">{generatedAt}</span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {isLoading && (
          <div className="rounded-xl border border-[#8FD4A8] bg-[#F2F7F4] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 animate-spin rounded-full border-2 border-[#8FD4A8] border-t-[#2E7D55]" />
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-[#1E3A2F]">Generating summary...</p>
                <div className="h-2.5 w-full rounded bg-[#DDECE4] animate-pulse" />
                <div className="h-2.5 w-4/5 rounded bg-[#DDECE4] animate-pulse" />
                <div className="h-2.5 w-2/3 rounded bg-[#DDECE4] animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Unable to load AI summary.</p>
            <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && (
        <p className="text-gray-600 leading-relaxed">
          {hasSummary
            ? summary
            : 'Summary not available yet. Upload a document to generate an AI summary.'}
        </p>
        )}

        {!isLoading && !errorMessage && keyPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[#1E3A2F] mb-2">Key points</h4>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li key={`${point}-${index}`} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-[#F2F7F4] text-[#2E7D55] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isLoading && !errorMessage && recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[#1E3A2F] mb-2">Suggested next steps</h4>
            <ul className="space-y-2">
              {recommendations.map((step, index) => (
                <li key={`${step}-${index}`} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-[#2E7D55] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummaryCard;
