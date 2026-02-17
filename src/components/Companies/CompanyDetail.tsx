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

const avatarColors = [
  'from-primary to-pink-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-red-600',
  'from-lime-500 to-green-600',
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
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

  const companyIndex = (companies as Company[]).findIndex(c => c.id === id);
  const company = (companies as Company[])[companyIndex];

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

  const colorClass = avatarColors[companyIndex % avatarColors.length];
  const note = getNote(company.id);
  const noteEmpty = isNoteEmpty(company.id);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-4 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={22} />
        </button>
        {company.logo ? (
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 p-2">
            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0`}>
            <span className="text-white font-display font-bold text-lg">{getInitials(company.name)}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl">{company.name}</h1>
            {company.booth && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                Monter {company.booth}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {company.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary/80 border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => toggleFavorite(company.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all min-h-[48px] ${
            isFavorite(company.id)
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-surface border border-border text-text-muted hover:border-gold/30 hover:text-gold'
          }`}
        >
          <Star size={18} className={isFavorite(company.id) ? 'fill-gold' : ''} />
          {isFavorite(company.id) ? 'Favorit' : 'Favoritmarkera'}
        </button>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-surface border border-border text-text-muted hover:border-primary/30 hover:text-primary transition-all min-h-[48px]"
        >
          <ExternalLink size={18} />
          Hemsida
        </a>
      </div>

      {/* Description */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider mb-2">Vad de gör</h2>
        <p className="text-[15px] leading-relaxed">{company.description}</p>
      </section>

      {/* Seeking */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider mb-3">Vad de söker</h2>
        <div className="flex flex-wrap gap-2">
          {company.seeking.map(role => (
            <span key={role} className="px-3 py-1.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* Locations */}
      {company.locations && company.locations.length > 0 && (
        <section className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-emerald-400" />
            <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider">Var de finns</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.locations.map((loc, i) => (
              <span key={loc} className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
                i === 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-surface-light text-text-muted border border-border/50'
              }`}>
                {loc}
              </span>
            ))}
          </div>
          {company.locations.length > 1 && (
            <p className="text-xs text-text-muted mt-2">{company.locations[0]} + {company.locations.length - 1} andra orter</p>
          )}
        </section>
      )}

      {/* Contacts */}
      {company.contacts.length > 0 && (
        <section className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider mb-3">Kontaktpersoner på GÖSTA</h2>
          <div className="space-y-3">
            {company.contacts.map((contact, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-light flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-text-muted">{contact.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-text-muted">{contact.role}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-primary/80 hover:text-primary truncate">
                        <Mail size={10} className="shrink-0" />
                        {contact.email}
                      </a>
                    )}
                    {contact.linkedin && (
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400/80 hover:text-blue-400">
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
      )}

      {/* Ice Breakers */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Snowflake size={18} className="text-cyan-400" />
          <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider">Ice-breakers</h2>
        </div>
        <div className="space-y-3">
          {company.iceBreakers.map((ib, i) => (
            <div key={i} className="relative bg-bg/50 rounded-xl p-3 border border-border/50">
              <p className="text-[14px] leading-relaxed pr-10">{ib}</p>
              <button
                onClick={() => copyToClipboard(ib, i)}
                className="absolute top-2 right-2 p-2 rounded-lg hover:bg-surface-light transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                {copiedIndex === i ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-text-muted" />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Questions */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircleQuestion size={18} className="text-gold" />
          <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider">Smarta frågor</h2>
        </div>
        <div className="space-y-2">
          {smartQuestions.map((q, i) => (
            <div key={i} className="flex gap-3 items-start py-1.5">
              <span className="text-primary font-display font-bold text-sm mt-0.5">{i + 1}.</span>
              <p className="text-[14px] leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider">Dina anteckningar</h2>
          <div className="flex items-center gap-2">
            {sugLoading && <Loader2 size={14} className="text-violet-400 animate-spin" />}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-emerald-400"
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
                  className="w-full bg-bg/50 border border-border/50 rounded-xl px-3 py-2.5 text-[14px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-y min-h-[44px]"
                />
              ) : (
                <input
                  type="text"
                  value={note[key]}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-bg/50 border border-border/50 rounded-xl px-3 py-2.5 text-[14px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 min-h-[44px]"
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
            className="mt-3 w-full flex items-start gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-left hover:bg-violet-500/15 transition-colors"
          >
            <Sparkles size={14} className="text-violet-400 shrink-0 mt-0.5" />
            <span className="text-[13px] text-violet-300 leading-relaxed">{suggestion}</span>
          </button>
        )}
        {!noteEmpty && (
          <div className="mt-3">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors min-h-[44px] px-1"
              >
                <Trash2 size={13} />
                Rensa anteckningar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Rensa alla fält?</span>
                <button
                  onClick={() => { clearNote(company.id); setShowClearConfirm(false); showSaved(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white min-h-[36px]"
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
    </motion.div>
  );
}
