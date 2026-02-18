import { useState, useRef, useCallback } from 'react';
import { Sparkles, Loader2, Save, Trash2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../../hooks/useProfile';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { haptic } from '../../utils/haptic';
import type { StructuredNote } from '../../types';

const noteFields: { key: keyof StructuredNote; label: string; placeholder: string }[] = [
  { key: 'talkedTo', label: 'Pratade med', placeholder: 'Namn på personen' },
  { key: 'role', label: 'Roll', placeholder: 'T.ex. Rekryterare, Tech Lead' },
  { key: 'about', label: 'Om', placeholder: 'Vad pratade ni om?' },
  { key: 'nextStep', label: 'Nästa steg', placeholder: 'T.ex. Skicka CV, boka intervju' },
  { key: 'followUp', label: 'Följa upp', placeholder: 'Kontakt, datum, LinkedIn' },
  { key: 'extra', label: 'Övrigt', placeholder: 'Fria anteckningar...' },
];

interface Props {
  companyId: string;
  companyName: string;
  companyDescription: string;
}

function NoteField({ fieldKey, label, placeholder, value, onChange, onSuggestion }: {
  fieldKey: keyof StructuredNote;
  label: string;
  placeholder: string;
  value: string;
  onChange: (field: keyof StructuredNote, value: string) => void;
  onSuggestion?: (text: string) => void;
}) {
  const isTextarea = fieldKey === 'extra' || fieldKey === 'about';

  const handleVoice = useCallback((text: string) => {
    haptic('light');
    const updated = value ? value.trimEnd() + ' ' + text : text;
    onChange(fieldKey, updated);
    if (onSuggestion) onSuggestion(updated);
  }, [value, fieldKey, onChange, onSuggestion]);

  const { listening, supported, toggle } = useSpeechRecognition(handleVoice);

  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      <div className="flex items-start gap-1.5">
        {isTextarea ? (
          <textarea
            value={value}
            onChange={(e) => {
              onChange(fieldKey, e.target.value);
              if (onSuggestion) onSuggestion(e.target.value);
            }}
            placeholder={placeholder}
            rows={fieldKey === 'extra' ? 3 : 2}
            className="flex-1 bg-bg border border-border-subtle rounded-[10px] px-3.5 py-3 text-[14px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow resize-y min-h-[44px] transition-all"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-bg border border-border-subtle rounded-[10px] px-3.5 py-3 text-[14px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px] transition-all"
          />
        )}
        {supported && (
          <button
            type="button"
            onClick={toggle}
            className={`shrink-0 p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              listening ? 'bg-error/20 text-error animate-pulse' : 'text-text-dim hover:text-primary hover:bg-glass-hover'
            }`}
            aria-label={listening ? `Stoppa inspelning för ${label}` : `Spela in ${label}`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function NotesSection({ companyId, companyName, companyDescription }: Props) {
  const { getNote, updateNote, clearNote, isNoteEmpty } = useNotes();
  const [suggestion, setSuggestion] = useState('');
  const [sugLoading, setSugLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const sugTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sugController = useRef<AbortController>(undefined);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const note = getNote(companyId);
  const noteEmpty = isNoteEmpty(companyId);

  const showSaved = useCallback(() => {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleFieldChange = useCallback((field: keyof StructuredNote, value: string) => {
    updateNote(companyId, field, value);
    showSaved();
  }, [companyId, updateNote, showSaved]);

  const fetchSuggestion = useCallback((noteText: string) => {
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (sugController.current) sugController.current.abort();
    setSuggestion('');

    if (!noteText || noteText.trim().length < 15) return;

    sugTimer.current = setTimeout(async () => {
      setSugLoading(true);
      const ctrl = new AbortController();
      sugController.current = ctrl;
      const timeout = setTimeout(() => ctrl.abort(), 10000);
      try {
        const res = await fetch('/api/suggest-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note: noteText,
            companyName,
            companyDescription,
          }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (data.suggestion && !ctrl.signal.aborted) {
          setSuggestion(data.suggestion);
        }
      } catch {
        // ignore abort / errors
      } finally {
        clearTimeout(timeout);
        if (!ctrl.signal.aborted) setSugLoading(false);
      }
    }, 1500);
  }, [companyName, companyDescription]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm">04</span>
          <h2 className="font-medium text-[12px] text-text-muted uppercase tracking-[0.08em]">Dina anteckningar</h2>
        </div>
        <div className="flex items-center gap-2">
          {sugLoading && <Loader2 size={14} className="text-primary animate-spin" />}
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
      </div>
      <div className="space-y-3">
        {noteFields.map(({ key, label, placeholder }) => (
          <NoteField
            key={key}
            fieldKey={key}
            label={label}
            placeholder={placeholder}
            value={note[key]}
            onChange={handleFieldChange}
            onSuggestion={key === 'extra' ? fetchSuggestion : undefined}
          />
        ))}
      </div>
      {suggestion && (
        <button
          onClick={() => {
            const current = note.extra;
            handleFieldChange('extra', current ? current.trimEnd() + '\n' + suggestion : suggestion);
            setSuggestion('');
          }}
          className="mt-3 w-full flex items-start gap-2 bg-accent-glow border border-tag-border rounded-[10px] p-3 text-left hover:bg-accent-glow-strong transition-colors"
        >
          <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
          <span className="text-[13px] text-primary-hover leading-relaxed">{suggestion}</span>
        </button>
      )}
      {!noteEmpty && (
        <div className="mt-3">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-text-dim hover:text-error transition-colors min-h-[44px] px-1"
            >
              <Trash2 size={13} />
              Rensa anteckningar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-error">Rensa alla fält?</span>
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
