import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Copy, Check, Snowflake, MessageCircleQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
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

const NOTE_TEMPLATE = `Pratade med: \nRoll: \nOm: \nNästa steg: \nFölja upp: `;

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
  const { getNote, setNote } = useNotes();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const companyIndex = (companies as Company[]).findIndex(c => c.id === id);
  const company = (companies as Company[])[companyIndex];

  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-muted">Företaget hittades inte.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-medium">Tillbaka</button>
      </div>
    );
  }

  const colorClass = avatarColors[companyIndex % avatarColors.length];
  const noteValue = getNote(company.id) || NOTE_TEMPLATE;

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
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0`}>
          <span className="text-white font-display font-bold text-lg">{getInitials(company.name)}</span>
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-xl">{company.name}</h1>
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

      {/* Contacts */}
      {company.contacts.length > 0 && (
        <section className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider mb-3">Kontaktpersoner</h2>
          <div className="space-y-2">
            {company.contacts.map((contact, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                  <span className="text-xs font-bold text-text-muted">{contact.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-text-muted">{contact.role}</p>
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
        <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wider mb-3">Dina anteckningar</h2>
        <textarea
          value={noteValue}
          onChange={(e) => setNote(company.id, e.target.value)}
          rows={6}
          className="w-full bg-bg/50 border border-border/50 rounded-xl p-3 text-[14px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-y min-h-[120px]"
        />
      </section>
    </motion.div>
  );
}
