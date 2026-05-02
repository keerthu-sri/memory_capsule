import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../theme/ThemeToggle';
import { MiniModal } from '../ui/MiniModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem('token');
  const avatar = localStorage.getItem('userAvatar') || "https://i.pravatar.cc/150?img=33";
  const [searchText, setSearchText] = React.useState(searchParams.get("q") || "");
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => {
    setSearchText(searchParams.get("q") || "");
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    if (!localStorage.getItem('remember')) localStorage.removeItem('remember');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleSearch = () => {
    const q = searchText.trim();
    const basePath = location.pathname === "/login" || location.pathname === "/" ? "/dashboard" : location.pathname;
    navigate(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  };

  return (
    <div className="theme-shell min-h-screen relative overflow-hidden">
      <div className="absolute w-full h-full top-0 left-0">
        <div className="theme-overlay" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--app-accent)] rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--app-accent-2)] rounded-full blur-3xl opacity-10" />
      </div>

      <header className="theme-header relative border-b backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-12 py-6 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(token ? "/dashboard" : "/login")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7919e6] to-[#a855f7] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--app-text)]">MEMORY CAPSULE</span>
          </div>

          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate('/dashboard')}
              className={cn("transition-colors text-sm font-medium", location.pathname === '/dashboard' ? "text-[var(--app-accent)]" : "theme-muted hover:text-[var(--app-text)]")}
            >
              Vaults
            </button>
            <button
              onClick={() => navigate('/calendarview')}
              className={cn("transition-colors text-sm font-medium", location.pathname === '/calendarview' ? "text-[var(--app-accent)]" : "theme-muted hover:text-[var(--app-text)]")}
            >
              Calendar
            </button>
            <button
              onClick={() => navigate('/timeline')}
              className={cn("transition-colors text-sm font-medium", location.pathname === '/timeline' ? "text-[var(--app-accent)]" : "theme-muted hover:text-[var(--app-text)]")}
            >
              Timeline
            </button>
            <button
              onClick={() => navigate('/shared')}
              className={cn("transition-colors text-sm font-medium", location.pathname === '/shared' ? "text-[var(--app-accent)]" : "theme-muted hover:text-[var(--app-text)]")}
            >
              Shared
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <input
              type="text"
              placeholder="Search Memories"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="theme-input rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--app-accent)] transition-colors w-64"
            />
            {token ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-sm theme-muted hover:text-[var(--app-text)] px-3 py-2 border border-[var(--app-border-soft)] rounded-lg"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-sm theme-muted hover:text-[var(--app-text)] px-3 py-2 border border-[var(--app-border-soft)] rounded-lg"
              >
                Login
              </button>
            )}
            <div 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#7919e6] cursor-pointer hover:shadow-[0_0_15px_#7919e6] transition-all"
            >
              <img src={avatar} alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1800px] mx-auto px-12 py-12">
        {children}
      </main>

      <MiniModal
        open={showLogoutModal}
        title="Log out?"
        description="You’ll be signed out of this device, and you can log back in anytime."
        confirmLabel="Log out"
        cancelLabel="Stay here"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};
