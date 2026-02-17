import { NavLink } from 'react-router-dom';
import { Building2, Star, QrCode, CalendarDays, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Building2, label: 'Företag' },
  { to: '/favoriter', icon: Star, label: 'Favoriter' },
  { to: '/qr', icon: QrCode, label: 'QR-koder' },
  { to: '/schema', icon: CalendarDays, label: 'Schema' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-glass-border md:hidden" style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(20px) saturate(180%)' }}>
      <div className="flex items-center justify-around px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', height: '60px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] min-h-[44px] transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                </motion.div>
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="w-1 h-1 rounded-full bg-primary"
                    style={{ boxShadow: '0 0 6px rgba(99, 102, 241, 0.6)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
