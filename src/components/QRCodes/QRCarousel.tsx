import { useNavigate } from 'react-router-dom';
import { Linkedin, Globe, Github, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';
import QRCard from './QRCard';

interface QRItem {
  key: string;
  title: string;
  urlBuilder: (value: string) => string;
  icon: React.ReactNode;
  color: string;
  profileKey: 'linkedin' | 'portfolio' | 'github' | 'cvUrl';
}

const qrItems: QRItem[] = [
  {
    key: 'linkedin',
    title: 'LinkedIn',
    urlBuilder: (v) => `https://linkedin.com/in/${v}`,
    icon: <Linkedin size={20} />,
    color: 'text-[#818cf8]',
    profileKey: 'linkedin',
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    urlBuilder: (v) => v.startsWith('http') ? v : `https://${v}`,
    icon: <Globe size={20} />,
    color: 'text-success',
    profileKey: 'portfolio',
  },
  {
    key: 'github',
    title: 'GitHub',
    urlBuilder: (v) => `https://github.com/${v}`,
    icon: <Github size={20} />,
    color: 'text-text',
    profileKey: 'github',
  },
  {
    key: 'cv',
    title: 'CV',
    urlBuilder: (v) => v.startsWith('http') ? v : `https://${v}`,
    icon: <FileText size={20} />,
    color: 'text-gold',
    profileKey: 'cvUrl',
  },
];

export default function QRCarousel() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const configured = qrItems.filter(item => profile[item.profileKey]);
  const unconfigured = qrItems.filter(item => !profile[item.profileKey]);

  if (configured.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-glass border border-glass-border flex items-center justify-center mb-4">
          <FileText size={28} className="text-text-dim" />
        </div>
        <h2 className="font-semibold text-lg mb-2">Inga QR-koder ännu</h2>
        <p className="text-text-muted text-sm max-w-[280px]">
          Fyll i din LinkedIn, portfolio, GitHub eller CV i profilen för att generera QR-koder!
        </p>
        <button
          onClick={() => navigate('/profil')}
          className="mt-6 font-semibold px-6 py-3 rounded-[10px] text-sm min-h-[44px] text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)' }}
        >
          Gå till profil
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 pt-6 pb-3 shrink-0">
        <h2 className="font-semibold text-lg">Dina QR-koder</h2>
        <p className="text-text-muted text-sm mt-1">Visa för rekryterare – de skannar direkt</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {configured.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <QRCard
                title={item.title}
                url={item.urlBuilder(profile[item.profileKey])}
                icon={item.icon}
                color={item.color}
              />
            </motion.div>
          ))}
          {unconfigured.map(item => (
            <div
              key={item.key}
              className="cursor-pointer"
              onClick={() => navigate('/profil')}
            >
              <div className="bg-glass border border-dashed border-glass-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-surface border border-glass-border flex items-center justify-center">
                  <Plus size={20} className="text-text-dim" />
                </div>
                <p className="font-medium text-text-dim text-sm">Lägg till {item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
