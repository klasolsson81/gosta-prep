import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Loader2, Check, Pencil } from 'lucide-react';
import type { Company } from '../../types';

interface AddCompanyProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Company, 'id' | 'isCustom'>) => void;
}

interface ScanResult {
  name: string | null;
  description: string | null;
  website: string;
  tags: string[];
  logo: string | null;
}

export default function AddCompany({ open, onClose, onAdd }: AddCompanyProps) {
  const [step, setStep] = useState<'url' | 'preview'>('url');
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('');

  const reset = () => {
    setStep('url');
    setUrl('');
    setScanning(false);
    setError('');
    setName('');
    setDescription('');
    setTags('');
    setWebsite('');
    setLogo('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    setError('');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch('/api/scan-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal,
      });
      const data: ScanResult & { error?: string } = await res.json();

      if (data.error) {
        setError(data.error);
        setScanning(false);
        return;
      }

      setName(data.name || '');
      setDescription(data.description || '');
      setTags(data.tags?.join(', ') || '');
      setWebsite(data.website || url.trim());
      setLogo(data.logo || '');
      setStep('preview');
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setError('Det tog för lång tid — försök igen');
      } else {
        setError('Kunde inte skanna hemsidan');
      }
    } finally {
      clearTimeout(timeout);
      setScanning(false);
    }
  };

  const handleAdd = () => {
    if (!name.trim()) return;

    const normalizedWebsite = website.startsWith('http') ? website : `https://${website}`;

    onAdd({
      name: name.trim(),
      logo: logo,
      description: description.trim(),
      seeking: [],
      contacts: [],
      website: normalizedWebsite,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      iceBreakers: [],
      locations: [],
    });

    handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-text-dim/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="font-semibold text-lg">Lägg till företag</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-glass-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>

            <div className="px-4 pb-8">
              {step === 'url' && (
                <div className="space-y-4">
                  <p className="text-text-muted text-sm">
                    Ange företagets hemsida så skannar vi den automatiskt.
                  </p>

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                        placeholder="example.com"
                        className="w-full bg-bg border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px] transition-all"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleScan}
                      disabled={scanning || !url.trim()}
                      className="px-5 py-3 rounded-xl font-medium text-sm text-white min-h-[44px] min-w-[44px] disabled:opacity-40 transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                    >
                      {scanning ? <Loader2 size={18} className="animate-spin" /> : 'Skanna'}
                    </button>
                  </div>

                  {error && (
                    <p className="text-error text-sm">{error}</p>
                  )}
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Pencil size={14} className="text-primary" />
                    <p className="text-text-muted text-sm">Granska och redigera innan du lägger till.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Namn *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Företagsnamn"
                      className="w-full bg-bg border border-border-subtle rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Beskrivning</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Vad gör företaget?"
                      rows={3}
                      className="w-full bg-bg border border-border-subtle rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px] resize-y transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Taggar (kommaseparerade)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="t.ex. konsult, fintech"
                      className="w-full bg-bg border border-border-subtle rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Hemsida</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-bg border border-border-subtle rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px] transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep('url')}
                      className="flex-1 py-3 rounded-xl font-medium text-sm text-text-muted bg-glass border border-glass-border min-h-[44px] transition-all hover:bg-glass-hover"
                    >
                      Tillbaka
                    </button>
                    <button
                      onClick={handleAdd}
                      disabled={!name.trim()}
                      className="flex-1 py-3 rounded-xl font-medium text-sm text-white min-h-[44px] disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                    >
                      <Check size={16} />
                      Lägg till
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
