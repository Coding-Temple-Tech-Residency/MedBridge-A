import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;