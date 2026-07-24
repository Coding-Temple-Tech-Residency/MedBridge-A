import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { HealthCategory } from '../../types';
import DashboardChartCard from './DashboardChartCard';

type HealthCategoryRadarChartProps = {
  data: HealthCategory[];
};

const HealthCategoryRadarChart: React.FC<HealthCategoryRadarChartProps> = ({ data }) => {
  return (
    <DashboardChartCard
      title="Health Category Snapshot"
      description="Placeholder radar view for backend category scoring data."
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 18, left: 18, bottom: 8 }}>
          <PolarGrid stroke="#8FD4A8" strokeOpacity={0.5} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#1E3A2F', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#2E7D55"
            fill="#2E7D55"
            fillOpacity={0.24}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value) => [`${value}/100`, 'Score']}
            contentStyle={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </DashboardChartCard>
  );
};

export default HealthCategoryRadarChart;