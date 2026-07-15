import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import DashboardNavigation from './DashboardNavigation';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const handleNavigate = () => {
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F2F7F4]">
      <header className="sticky top-0 z-30 border-b border-[#8FD4A8]/30 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
            aria-label="Go to dashboard"
          >
            <Logo size={34} />
            <span className="text-lg font-bold tracking-tight text-[#1E3A2F]">
              Med<span className="text-[#2E7D55]">Bridge</span>
              <span className="text-[#D4A843]">A</span>
            </span>
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-[#1E3A2F] lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="dashboard-navigation"
          >
            Menu
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div id="dashboard-navigation" className="hidden lg:block">
          <DashboardNavigation onLogout={handleLogout} />
        </div>

        {menuOpen && (
          <div className="mb-4 lg:hidden">
            <DashboardNavigation onLogout={handleLogout} onNavigate={handleNavigate} />
          </div>
        )}

        <main className="pt-5 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;