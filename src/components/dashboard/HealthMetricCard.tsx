import Card from '../UI/Card';
import type { HealthMetric, MetricStatus } from '../../types';

type HealthMetricCardProps = {
  metric: HealthMetric;
};

type StatusStyles = {
  badge: string;
  value: string;
  marker: string;
  label: string;
};

const statusStyles: Record<MetricStatus, StatusStyles> = {
  normal: {
    badge: 'border-[#8FD4A8] bg-[#EAF6EE] text-[#2E7D55]',
    value: 'text-[#2E7D55]',
    marker: 'bg-[#2E7D55]',
    label: 'Normal',
  },
  elevated: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    value: 'text-amber-700',
    marker: 'bg-[#D4A843]',
    label: 'Elevated',
  },
  low: {
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    value: 'text-blue-700',
    marker: 'bg-blue-500',
    label: 'Low',
  },
};

const formatValue = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({ metric }) => {
  const styles = statusStyles[metric.status];

  const rangePadding = (metric.normalMax - metric.normalMin) * 0.45;
  const displayMin = Math.max(0, metric.normalMin - rangePadding);
  const displayMax = metric.normalMax + rangePadding;
  const totalRange = displayMax - displayMin;

  const normalStartPct = ((metric.normalMin - displayMin) / totalRange) * 100;
  const normalWidthPct = ((metric.normalMax - metric.normalMin) / totalRange) * 100;
  const valuePct = totalRange > 0 ? clampPercent(((metric.value - displayMin) / totalRange) * 100) : 0;

  return (
    <Card
      className={`border transition-shadow duration-200 hover:shadow-md ${
        metric.status === 'normal' ? 'border-[#8FD4A8]/45' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1E3A2F]">{metric.name}</p>
          <p className="mt-1 text-xs text-gray-500">{metric.description}</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles.badge}`}>
          {styles.label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className={`text-2xl font-bold ${styles.value}`}>
          {formatValue(metric.value)}
          <span className="ml-1 text-xs font-medium text-gray-400">{metric.unit}</span>
        </p>
        <p className="text-xs font-semibold text-gray-400">{metric.shortName}</p>
      </div>

      <div className="mt-3">
        <div className="relative h-2.5 rounded-full bg-gray-100">
          <div
            className="absolute h-full rounded-full bg-[#8FD4A8]/60"
            style={{ left: `${normalStartPct}%`, width: `${normalWidthPct}%` }}
          />
          <div
            className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${styles.marker}`}
            style={{ left: `${valuePct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span>{formatValue(metric.normalMin)}</span>
          <span>
            Normal {formatValue(metric.normalMin)}-{formatValue(metric.normalMax)} {metric.unit}
          </span>
          <span>{formatValue(metric.normalMax)}</span>
        </div>
      </div>
    </Card>
  );
};

export default HealthMetricCard;