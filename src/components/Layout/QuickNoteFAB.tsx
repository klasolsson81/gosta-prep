import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { NotebookPen, X, Search, Check, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import companies from '../../data/companies.json';
import { useNotes } from '../../hooks/useProfile';
import { useCustomCompanies } from '../../hooks/useCustomCompanies';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { haptic } from '../../utils/haptic';
import type { Company } from '../../types';

export default function QuickNoteFAB() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [talkedTo, setTalkedTo] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saved, setSaved] = useState(false);
  const { updateNote } = useNotes();
  const { customCompanies } = useCustomCompanies();
  const searchRef = useRef<HTMLInputElement>(null);
  const talkedToRef = useRef<HTMLInputElement>(null);

  const handleVoiceTalkedTo = useCallback((text: string) => {
    haptic('light');
    setTalkedTo(prev => prev ? prev.trimEnd() + ' ' + text : text);
  }, []);
  const handleVoiceNextStep = useCallback((text: string) => {
    haptic('light');
    setNextStep(prev => prev ? prev.trimEnd() + ' ' + text : text);
  }, []);
  const voiceTalkedTo = useSpeechRecognition(handleVoiceTalkedTo);
  const voiceNextStep = useSpeechRecognition(handleVoiceNextStep);

  const allCompanies = useMemo(() => {
    return [...(companies as Company[]), ...customCompanies];
  }, [customCompanies]);

  const filtered = useMemo(() => {
    let list = allCompanies;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
  }, [search, allCompanies]);

  useEffect(() => {
    if (open && !selectedCompany) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open, selectedCompany]);

  useEffect(() => {
    if (selectedCompany) {
      setTimeout(() => talkedToRef.current?.focus(), 100);
    }
  }, [selectedCompany]);

  const handleOpen = () => {
    haptic('light');
    setOpen(true);
    setSearch('');
    setSelectedCompany(null);
    setTalkedTo('');
    setNextStep('');
    setSaved(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    if (!selectedCompany) return;
    if (talkedTo.trim()) updateNote(selectedCompany.id, 'talkedTo', talkedTo.trim());
    if (nextStep.trim()) updateNote(selectedCompany.id, 'nextStep', nextStep.trim());
    haptic('medium');
    setSaved(true);
    setTimeout(() => {
      setOpen(false);
      setSaved(false);
    }, 800);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg md:bottom-8"
        style={{ boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
      >
        <NotebookPen size={22} />
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/60"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-glass-border rounded-t-2xl max-h-[85vh] flex flex-col"
            >
              {/* Handle + header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <NotebookPen size={16} className="text-primary" />
                  <h3 className="font-medium text-sm">Snabb anteckning</h3>
                </div>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-glass-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X size={18} className="text-text-muted" />
                </button>
              </div>

              <div className="px-4 pb-24 flex-1 overflow-y-auto overscroll-contain min-h-0">
                {saved ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-8 gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <Check size={24} className="text-success" />
                    </div>
                    <p className="text-success font-medium">Sparat!</p>
                  </motion.div>
                ) : !selectedCompany ? (
                  <>
                    {/* Company search */}
                    <div className="relative mb-3">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Sök företag..."
                        className="w-full bg-bg border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-1">
                      {filtered.map(company => (
                        <button
                          key={company.id}
                          onClick={() => setSelectedCompany(company)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-hover transition-colors text-left min-h-[44px]"
                        >
                          {company.logo ? (
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 shrink-0">
                              <img src={company.logo} alt="" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-accent-glow flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">{company.name[0]}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text truncate">{company.name}</p>
                            {company.booth && (
                              <p className="text-[11px] text-text-dim">Monter {company.booth}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Quick note fields */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-glass-border">
                      <button
                        onClick={() => setSelectedCompany(null)}
                        className="text-primary text-xs font-medium"
                      >
                        Byt
                      </button>
                      <span className="text-sm font-medium text-text">{selectedCompany.name}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">Pratade med</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            ref={talkedToRef}
                            type="text"
                            value={talkedTo}
                            onChange={(e) => setTalkedTo(e.target.value)}
                            placeholder="Namn"
                            className="flex-1 bg-bg border border-border-subtle rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px]"
                          />
                          {voiceTalkedTo.supported && (
                            <button
                              type="button"
                              onClick={voiceTalkedTo.toggle}
                              className={`shrink-0 p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                voiceTalkedTo.listening ? 'bg-error/20 text-error animate-pulse' : 'text-text-dim hover:text-primary hover:bg-glass-hover'
                              }`}
                              aria-label={voiceTalkedTo.listening ? 'Stoppa inspelning' : 'Spela in'}
                            >
                              {voiceTalkedTo.listening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">Nästa steg</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={nextStep}
                            onChange={(e) => setNextStep(e.target.value)}
                            placeholder="T.ex. Skicka CV, boka intervju"
                            className="flex-1 bg-bg border border-border-subtle rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px]"
                          />
                          {voiceNextStep.supported && (
                            <button
                              type="button"
                              onClick={voiceNextStep.toggle}
                              className={`shrink-0 p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                voiceNextStep.listening ? 'bg-error/20 text-error animate-pulse' : 'text-text-dim hover:text-primary hover:bg-glass-hover'
                              }`}
                              aria-label={voiceNextStep.listening ? 'Stoppa inspelning' : 'Spela in'}
                            >
                              {voiceNextStep.listening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={!talkedTo.trim() && !nextStep.trim()}
                      className="w-full mt-4 py-3 rounded-xl text-sm font-semibold bg-primary text-white min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
                    >
                      Spara
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
