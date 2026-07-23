import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HealthTrendPoint } from '../../types';
import DashboardChartCard from './DashboardChartCard';

type HealthTrendChartProps = {
  data: HealthTrendPoint[];
};

const HealthTrendChart: React.FC<HealthTrendChartProps> = ({ data }) => {
  return (
    <DashboardChartCard
      title="Metric Trends"
      description="Placeholder trend lines for monthly metrics from mock data."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 18, left: 6, bottom: 8 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} width={34} />
          <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E5E7EB' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="glucose"
            stroke="#D4A843"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            name="Glucose"
          />
          <Line
            type="monotone"
            dataKey="ldl"
            stroke="#2E7D55"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            name="LDL"
          />
          <Line
            type="monotone"
            dataKey="triglycerides"
            stroke="#1E3A2F"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            name="Triglycerides"
          />
        </LineChart>
      </ResponsiveContainer>
    </DashboardChartCard>
  );
};

export default HealthTrendChart;