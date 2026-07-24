import { useNavigate } from 'react-router-dom';
import { mockAnalysisResult, mockHealthTrendData } from '../mockData';
import Card from './UI/Card';
import Button from './UI/Button';
import HealthCategoryRadarChart from './dashboard/HealthCategoryRadarChart';
import HealthMetricCard from './dashboard/HealthMetricCard';
import HealthTrendChart from './dashboard/HealthTrendChart';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const result = mockAnalysisResult;

  const metricsForCards = result.metrics.slice(0, 6);
  const normalMetricCount = result.metrics.filter((metric) => metric.status === 'normal').length;
  const elevatedMetricCount = result.metrics.filter((metric) => metric.status === 'elevated').length;
  const lowMetricCount = result.metrics.filter((metric) => metric.status === 'low').length;
  const averageCategoryScore = Math.round(
    result.healthCategories.reduce((sum, category) => sum + category.score, 0) /
      result.healthCategories.length,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#1E3A2F] via-[#2E7D55] to-[#66B48B] px-6 py-8 text-white shadow-lg sm:px-8">
        <p className="mb-2 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Health dashboard overview</h1>
        <p className="mt-3 max-w-2xl text-white/85">
          Reusable cards and chart modules are now wired to mock health data, making this layout
          ready for backend-driven metrics.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => navigate('/upload')}
            className="bg-[#D4A843] text-[#1E3A2F] hover:bg-[#c49630]"
          >
            Upload New Document
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/results')}
            className="border-white/60 text-white hover:bg-white/10"
          >
            View Latest Results
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#8FD4A8]/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Overall Status</p>
          <p className="mt-2 text-3xl font-bold text-[#1E3A2F]">{result.overallStatus}</p>
          <p className="mt-1 text-sm text-gray-500">Based on the latest uploaded report.</p>
        </Card>

        <Card className="border-[#8FD4A8]/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Metric Mix</p>
          <p className="mt-2 text-3xl font-bold text-[#1E3A2F]">
            {normalMetricCount} <span className="text-base font-medium text-gray-400">normal</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {elevatedMetricCount} elevated, {lowMetricCount} low.
          </p>
        </Card>

        <Card className="border-[#8FD4A8]/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">
            Category Average
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1E3A2F]">{averageCategoryScore}/100</p>
          <p className="mt-1 text-sm text-gray-500">Computed across core health categories.</p>
        </Card>

        <Card className="border-[#8FD4A8]/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Data Source</p>
          <p className="mt-2 text-3xl font-bold text-[#1E3A2F]">Mock</p>
          <p className="mt-1 text-sm text-gray-500">Ready to swap with backend dashboard endpoints.</p>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A2F]">Health Metric Cards</h2>
            <p className="text-sm text-gray-500">
              Reusable metric cards to display backend health values consistently.
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/results')} className="text-[#1E3A2F]">
            See Full Analysis
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricsForCards.map((metric) => (
            <HealthMetricCard key={metric.name} metric={metric} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[#1E3A2F]">Dashboard Charts</h2>
        <p className="mt-1 text-sm text-gray-500">
          Placeholder Recharts components wired to mock data models.
        </p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <HealthCategoryRadarChart data={result.healthCategories} />
          <HealthTrendChart data={mockHealthTrendData} />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;