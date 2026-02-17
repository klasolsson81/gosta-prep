import { NavLink } from 'react-router-dom';
import { Building2, Star, QrCode, CalendarDays, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Building2, label: 'Företag' },
  { to: '/favoriter', icon: Star, label: 'Favoriter' },
  { to: '/qr', icon: QrCode, label: 'QR-koder' },
  { to: '/schema', icon: CalendarDays, label: 'Schema' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-lg md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[44px] rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
