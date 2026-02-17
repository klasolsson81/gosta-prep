import { Outlet, NavLink } from 'react-router-dom';
import { Building2, Star, QrCode, CalendarDays, User } from 'lucide-react';
import BottomNav from './BottomNav';

const navItems = [
  { to: '/', icon: Building2, label: 'Företag' },
  { to: '/favoriter', icon: Star, label: 'Favoriter' },
  { to: '/qr', icon: QrCode, label: 'QR' },
  { to: '/schema', icon: CalendarDays, label: 'Schema' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* Desktop top nav */}
      <header className="hidden md:block sticky top-0 z-50 border-b border-glass-border" style={{ background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px) saturate(180%)' }}>
        <div className="max-w-[480px] mx-auto px-6 flex items-center justify-between h-14">
          <h1 className="font-display text-xl font-bold tracking-tight">
            <span className="text-primary">GÖSTA</span> <span className="text-text">Prep</span>
          </h1>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? 'text-primary bg-accent-glow'
                      : 'text-text-muted hover:text-text hover:bg-glass-hover'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-50 border-b border-glass-border" style={{ background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px) saturate(180%)' }}>
        <div className="flex items-center justify-center h-14">
          <h1 className="font-display text-lg font-bold tracking-tight">
            <span className="text-primary">GÖSTA</span> <span className="text-text">Prep</span>
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-20 md:pb-6 max-w-[480px] mx-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
