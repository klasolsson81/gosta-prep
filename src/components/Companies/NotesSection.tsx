import { useState, useRef, useCallback } from 'react';
import { Save, Trash2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../../hooks/useProfile';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { haptic } from '../../utils/haptic';

interface Props {
  companyId: string;
}

export default function NotesSection({ companyId }: Props) {
  const { getNote, setNote, clearNote, isNoteEmpty } = useNotes();
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const note = getNote(companyId);
  const noteEmpty = isNoteEmpty(companyId);

  const showSaved = useCallback(() => {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleChange = useCallback((value: string) => {
    setNote(companyId, value);
    showSaved();
  }, [companyId, setNote, showSaved]);

  const handleVoice = useCallback((text: string) => {
    haptic('light');
    const time = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    const entry = `${time} — ${text}`;
    const updated = note ? note.trimEnd() + '\n\n' + entry : entry;
    handleChange(updated);
  }, [note, handleChange]);

  const { listening, supported, error: voiceError, toggle } = useSpeechRecognition(handleVoice);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm">04</span>
          <h2 className="font-medium text-[12px] text-text-muted uppercase tracking-[0.08em]">Dina anteckningar</h2>
        </div>
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-success"
            >
              <Save size={12} />
              <span className="text-xs font-medium">Sparat</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-start gap-1.5">
        <textarea
          value={note}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv fritt — vem pratade du med, vad sa de, nästa steg..."
          rows={6}
          className="flex-1 bg-bg border border-border-subtle rounded-[10px] px-3.5 py-3 text-[14px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow resize-y min-h-[120px] transition-all"
        />
        {supported && (
          <button
            type="button"
            onClick={toggle}
            className={`shrink-0 p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              listening ? 'bg-error/20 text-error animate-pulse' : 'text-text-dim hover:text-primary hover:bg-glass-hover'
            }`}
            aria-label={listening ? 'Stoppa inspelning' : 'Spela in anteckning'}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {voiceError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-text-muted mt-2"
          >
            {voiceError}
          </motion.p>
        )}
      </AnimatePresence>

      {!noteEmpty && (
        <div className="mt-3">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-text-dim hover:text-error transition-colors min-h-[44px] px-1"
            >
              <Trash2 size={13} />
              Rensa anteckning
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-error">Rensa?</span>
              <button
                onClick={() => { clearNote(companyId); setShowClearConfirm(false); showSaved(); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-error text-white min-h-[36px]"
              >
                Ja, rensa
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border min-h-[36px]"
              >
                Avbryt
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
