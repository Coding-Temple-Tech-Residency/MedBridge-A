import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Button from './UI/Button';
import { setAccessToken } from '@/features/auth/authToken';
import { apiClient } from '@/api/client';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    setAccessToken(null);
    // Fire-and-forget: revokes the refresh cookie on the server.
    // Navigation proceeds immediately so the user is never blocked.
    apiClient.post('/api/auth/logout').catch(() => undefined);
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Logo + wordmark */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          aria-label="Go to homepage"
        >
          <Logo size={36} />
          <span className="text-lg font-bold tracking-tight text-[#1E3A2F]">
            Med<span className="text-[#2E7D55]">Bridge</span>
            <span className="text-[#D4A843]">A</span>
          </span>
        </button>

        {/* Right-side nav */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {pathname !== '/dashboard' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-[#1E3A2F] transition-colors font-medium"
            >
              ← Home
            </button>
          )}
          {pathname === '/dashboard' && (
            <Button onClick={() => navigate('/upload')}>
              Try It Free
            </Button>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-[#1E3A2F] transition-colors font-medium"
          >
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
