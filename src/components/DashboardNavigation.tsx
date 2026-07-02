import { NavLink } from 'react-router-dom';
import Button from './UI/Button';

type DashboardNavigationProps = {
  onLogout: () => void;
  onNavigate?: () => void;
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/upload', label: 'Upload' },
  { to: '/results', label: 'Results' },
];

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  onLogout,
  onNavigate,
}) => {
  return (
    <div className="rounded-2xl border border-[#8FD4A8]/40 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-[#1E3A2F] text-white'
                    : 'bg-[#F2F7F4] text-[#2E7D55] hover:bg-[#E5F2EA]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Button
          variant="ghost"
          onClick={onLogout}
          className="sm:self-auto self-start text-[#1E3A2F]"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardNavigation;