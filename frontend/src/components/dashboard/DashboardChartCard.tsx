import type { ReactNode } from 'react';
import Card from '../UI/Card';

type DashboardChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <Card className="h-full border-[#8FD4A8]/35">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#1E3A2F]">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </Card>
  );
};

export default DashboardChartCard;