import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import Logo from './Logo';

type PublicHeaderSection = 'upload' | 'chat' | 'results';

type PublicHeaderProps = {
  activeSection?: PublicHeaderSection;
};

const navItems: Array<{ key: PublicHeaderSection; label: string; path: string }> = [
  { key: 'upload', label: 'Upload', path: '/upload' },
  { key: 'chat', label: 'Chat', path: '/chat' },
  { key: 'results', label: 'Results', path: '/results' },
];

const PublicHeader: React.FC<PublicHeaderProps> = ({ activeSection }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const activeItem = navItems.find((item) => item.key === activeSection);

  return (
    <header className="sticky top-0 z-30 border-b border-[#8FD4A8]/30 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
          aria-label="Go to MedBridge home"
        >
          <Logo size={36} />
          <span className="text-lg font-bold tracking-tight text-[#1E3A2F]">
            Med<span className="text-[#2E7D55]">Bridge</span>
            <span className="text-[#D4A843]">A</span>
          </span>
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => {
            const isActive = item.key === activeSection;

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                disabled={isActive}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'cursor-default border-[#8FD4A8]/70 bg-[#EAF5EF] text-[#2E7D55]'
                    : 'border-[#8FD4A8] bg-[#F2F7F4] text-[#1E3A2F] hover:bg-[#E5F2EA]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!activeItem) {
                navigate('/upload');
              }
            }}
            disabled={Boolean(activeItem)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors lg:hidden ${
              activeItem
                ? 'cursor-default border-[#8FD4A8]/70 bg-[#EAF5EF] text-[#2E7D55]'
                : 'border-[#8FD4A8] bg-[#F2F7F4] text-[#1E3A2F] hover:bg-[#E5F2EA]'
            }`}
          >
            {activeItem ? activeItem.label : 'Upload'}
          </button>
          <button
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
            className="rounded-xl bg-[#1E3A2F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D55]"
          >
            {isAuthenticated ? 'Profile' : 'Sign In'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;