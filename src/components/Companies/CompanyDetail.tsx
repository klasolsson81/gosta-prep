import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Copy, Check, Snowflake, MessageCircleQuestion, Sparkles, Loader2, Trash2, Save, MapPin, Mail, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import companies from '../../data/companies.json';
import { useFavorites, useNotes } from '../../hooks/useProfile';
import type { Company } from '../../types';

const smartQuestions = [
  "Hur deployar ni idag och vad är er största flaskhals?",
  "Vilka buggar eller incidenter tar mest tid?",
  "Vad skiljer en junior som lyckas hos er från en som fastnar?",
  "Vilket system är mest känsligt – det ingen vill röra?",
  "Om jag bygger en liten POC på ert problem, vem vill ni att jag skickar den till?",
];

import type { StructuredNote } from '../../types';

const noteFields: { key: keyof StructuredNote; label: string; placeholder: string }[] = [
  { key: 'talkedTo', label: 'Pratade med', placeholder: 'Namn på personen' },
  { key: 'role', label: 'Roll', placeholder: 'T.ex. Rekryterare, Tech Lead' },
  { key: 'about', label: 'Om', placeholder: 'Vad pratade ni om?' },
  { key: 'nextStep', label: 'Nästa steg', placeholder: 'T.ex. Skicka CV, boka intervju' },
  { key: 'followUp', label: 'Följa upp', placeholder: 'Kontakt, datum, LinkedIn' },
  { key: 'extra', label: 'Övrigt', placeholder: 'Fria anteckningar...' },
];

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return Math.abs(hash);
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="font-medium text-[12px] text-text-muted uppercase tracking-[0.08em]">{label}</h2>
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getNote, updateNote, clearNote, isNoteEmpty } = useNotes();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [sugLoading, setSugLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const sugTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sugController = useRef<AbortController>(undefined);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const company = (companies as Company[]).find(c => c.id === id);

  const showSaved = useCallback(() => {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleFieldChange = useCallback((field: keyof StructuredNote, value: string) => {
    if (!company) return;
    updateNote(company.id, field, value);
    showSaved();
  }, [company, updateNote, showSaved]);

  const fetchSuggestion = useCallback((noteText: string) => {
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (sugController.current) sugController.current.abort();
    setSuggestion('');

    if (!company || !noteText || noteText.trim().length < 15) return;

    sugTimer.current = setTimeout(async () => {
      setSugLoading(true);
      const ctrl = new AbortController();
      sugController.current = ctrl;
      try {
        const res = await fetch('/api/suggest-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note: noteText,
            companyName: company.name,
            companyDescription: company.description,
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
        if (!ctrl.signal.aborted) setSugLoading(false);
      }
    }, 1500);
  }, [company?.name, company?.description]);

  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-muted">Företaget hittades inte.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-medium">Tillbaka</button>
      </div>
    );
  }

  const gradient = gradients[hashName(company.name) % gradients.length];
  const note = getNote(company.id);
  const noteEmpty = isNoteEmpty(company.id);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="px-4 py-4 space-y-0"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-glass-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-text-muted" />
        </button>
        <motion.button
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={() => toggleFavorite(company.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all min-h-[44px] ${
            isFavorite(company.id)
              ? 'text-gold bg-gold/10 border border-gold/20'
              : 'text-text-muted hover:text-gold border border-border-subtle hover:border-gold/20'
          }`}
        >
          <Star size={16} className={isFavorite(company.id) ? 'fill-gold' : ''} />
          {isFavorite(company.id) ? 'Favorit' : 'Favorit'}
        </motion.button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-2">
        {company.logo ? (
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 p-2 mb-3">
            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 mb-3"
            style={{ background: gradient }}
          >
            <span className="text-white font-bold text-xl">{getInitials(company.name)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-2xl">{company.name}</h1>
          {company.booth && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-accent-glow text-primary-hover border border-tag-border">
              Monter {company.booth}
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
          {company.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-tag-bg text-tag-text border border-tag-border tracking-wide">
              {tag}
            </span>
          ))}
        </div>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 mt-2 text-primary text-sm font-medium hover:text-primary-hover transition-colors"
        >
          <ExternalLink size={13} />
          {company.website.replace(/^https?:\/\//, '')}
        </a>
      </div>

      {/* Divider */}
      <div className="section-divider my-5" />

      {/* Description */}
      <section>
        <SectionHeader icon={<span className="text-primary text-sm">01</span>} label="Om företaget" />
        <p className="text-[14px] leading-relaxed text-text">{company.description}</p>
      </section>

      <div className="section-divider my-5" />

      {/* Seeking */}
      <section>
        <SectionHeader icon={<span className="text-primary text-sm">02</span>} label="Vad de söker" />
        <div className="flex flex-wrap gap-2">
          {company.seeking.map(role => (
            <span key={role} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent-glow text-primary-hover border border-tag-border">
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* Locations */}
      {company.locations && company.locations.length > 0 && (
        <>
          <div className="section-divider my-5" />
          <section>
            <SectionHeader icon={<MapPin size={14} className="text-success" />} label="Var de finns" />
            <div className="flex flex-wrap gap-2">
              {company.locations.map((loc, i) => (
                <span key={loc} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  i === 0 ? 'bg-success/10 text-success border border-success/20' : 'bg-glass text-text-muted border border-glass-border'
                }`}>
                  {loc}
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Contacts */}
      {company.contacts.length > 0 && (
        <>
          <div className="section-divider my-5" />
          <section>
            <SectionHeader icon={<span className="text-primary text-sm">03</span>} label="Kontaktpersoner på GÖSTA" />
            <div className="space-y-3">
              {company.contacts.map((contact, i) => (
                <div key={i} className="flex items-start gap-3 bg-glass border border-glass-border rounded-xl p-3">
                  <div className="w-9 h-9 rounded-full bg-surface-light flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-text-muted">{contact.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{contact.name}</p>
                    <p className="text-xs text-text-muted">{contact.role}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-primary/80 hover:text-primary truncate">
                          <Mail size={10} className="shrink-0" />
                          {contact.email}
                        </a>
                      )}
                      {contact.linkedin && (
                        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#818cf8]/80 hover:text-[#818cf8]">
                          <Linkedin size={10} className="shrink-0" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Ice Breakers */}
      <div className="section-divider my-5" />
      <section>
        <SectionHeader icon={<Snowflake size={14} className="text-cyan-400" />} label="Ice-breakers" />
        <div className="space-y-3">
          {company.iceBreakers.map((ib, i) => (
            <div key={i} className="relative bg-accent-glow border border-[rgba(99,102,241,0.15)] rounded-[10px] p-3.5">
              <p className="text-[14px] leading-relaxed pr-10 italic text-text">{ib}</p>
              <button
                onClick={() => copyToClipboard(ib, i)}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg hover:bg-glass-hover transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                {copiedIndex === i ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-text-dim" />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Questions */}
      <div className="section-divider my-5" />
      <section>
        <SectionHeader icon={<MessageCircleQuestion size={14} className="text-gold" />} label="Smarta frågor" />
        <div className="space-y-2">
          {smartQuestions.map((q, i) => (
            <div key={i} className="flex gap-3 items-start py-1.5">
              <span className="text-primary font-bold text-sm mt-0.5 font-mono">{i + 1}.</span>
              <p className="text-[14px] leading-relaxed text-text">{q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <div className="section-divider my-5" />
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={<span className="text-primary text-sm">04</span>} label="Dina anteckningar" />
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
            <div key={key}>
              <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
              {key === 'extra' || key === 'about' ? (
                <textarea
                  value={note[key]}
                  onChange={(e) => {
                    handleFieldChange(key, e.target.value);
                    if (key === 'extra') fetchSuggestion(e.target.value);
                  }}
                  placeholder={placeholder}
                  rows={key === 'extra' ? 3 : 2}
                  className="w-full bg-bg border border-border-subtle rounded-[10px] px-3.5 py-3 text-[14px] text-text placeholder:text-text-dim focus:outline-none focus:border-primary/50 focus:shadow-glow resize-y min-h-[44px] transition-all"
                />
              ) : (
                <input
                  type="text"
                  value={note[key]}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-bg border border-border-subtle rounded-[10px] px-3.5 py-3 text-[14px] text-text placeholder:text-text-dim focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[44px] transition-all"
                />
              )}
            </div>
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
                  onClick={() => { clearNote(company.id); setShowClearConfirm(false); showSaved(); }}
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

      {/* Bottom spacing */}
      <div className="h-4" />
    </motion.div>
  );
}
