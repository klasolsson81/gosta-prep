import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Copy, Check, Snowflake, MapPin, Mail, Linkedin, Camera, Zap, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import companies from '../../data/companies.json';
import { useFavorites } from '../../hooks/useProfile';
import { useCustomCompanies } from '../../hooks/useCustomCompanies';
import { useCompanyPhotos } from '../../hooks/useCompanyPhotos';
import PhotoGallery from './PhotoGallery';
import ElevatorPitch from './ElevatorPitch';
import NotesSection from './NotesSection';
import SmartQuestions from './SmartQuestions';
import type { Company } from '../../types';

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
  const { customCompanies, removeCompany } = useCustomCompanies();
  const { photos } = useCompanyPhotos(id ?? '');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Swipe right from left edge (start within 40px of left edge, move >100px right, mostly horizontal)
    if (touchStartX.current < 40 && dx > 100 && dy < 80) {
      navigate(-1);
    }
  }, [navigate]);

  const company = (companies as Company[]).find(c => c.id === id) || customCompanies.find(c => c.id === id);

  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-muted">Företaget hittades inte.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-medium">Tillbaka</button>
      </div>
    );
  }

  const gradient = gradients[hashName(company.name) % gradients.length];

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
      {company.iceBreakers.length > 0 && (
        <>
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
        </>
      )}

      {/* Elevator Pitch */}
      <div className="section-divider my-5" />
      <section>
        <button
          onClick={() => setShowPitch(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-accent-glow border border-tag-border text-primary-hover hover:bg-accent-glow-strong transition-all min-h-[44px]"
        >
          <Zap size={16} />
          Öva din pitch (30s)
        </button>
      </section>

      {showPitch && (
        <ElevatorPitch
          companyName={company.name}
          seeking={company.seeking}
          onClose={() => setShowPitch(false)}
        />
      )}

      {/* Smart Questions */}
      {!company.isCustom && (
        <>
          <div className="section-divider my-5" />
          <SmartQuestions />
        </>
      )}

      {/* Notes */}
      <div className="section-divider my-5" />
      <NotesSection
        companyId={company.id}
        companyName={company.name}
        companyDescription={company.description}
      />

      {/* Photos */}
      <div className="section-divider my-5" />
      <section>
        <SectionHeader
          icon={<Camera size={14} className="text-primary" />}
          label={`Foton${photos.length > 0 ? ` (${photos.length})` : ''}`}
        />
        <PhotoGallery companyId={company.id} />
      </section>

      {/* Delete custom company */}
      {company.isCustom && (
        <>
          <div className="section-divider my-5" />
          <section>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-text-dim hover:text-error transition-colors min-h-[44px] px-1"
              >
                <Trash2 size={15} />
                Ta bort detta företag
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-error">Ta bort {company.name}?</span>
                <button
                  onClick={() => { removeCompany(company.id); navigate(-1); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-error text-white min-h-[44px]"
                >
                  Ja, ta bort
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-surface border border-border min-h-[44px]"
                >
                  Avbryt
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {/* Bottom spacing */}
      <div className="h-4" />
    </motion.div>
  );
}
