import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const KEY = 'pwa-install-dismissed';

function isDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function PwaInstallBanner() {
  const [visible, setVisible] = useState(() => !isDismissed() && !isStandalone());

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch { /* quota exceeded */ }
    setVisible(false);
  };

  const iosText = 'Installera appen: tryck på \u25A1\u2191 och välj "Lägg till på hemskärmen"';
  const androidText = 'Installera appen: tryck på \u22EE och välj "Lägg till på startskärmen"';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-3 mb-3 flex items-start gap-3 rounded-xl border border-glass-border border-l-primary border-l-2 bg-glass backdrop-blur-md px-3.5 py-3"
    >
      <Download size={18} className="text-primary shrink-0 mt-0.5" />
      <p className="text-xs text-text-muted leading-relaxed flex-1">
        {isIOS() ? iosText : androidText}
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 p-1 -m-1 text-text-dim hover:text-text-muted transition-colors"
        aria-label="Stäng"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
