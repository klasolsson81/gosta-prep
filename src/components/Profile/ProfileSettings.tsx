import { useState } from 'react';
import { User, Linkedin, Globe, Github, FileText, Trash2, Info, Check, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';
import { useGitHubValidation, useLinkedInValidation, useUrlValidation, type ValidationStatus } from '../../hooks/useFieldValidation';

function ValidationBadge({ status, message }: { status: ValidationStatus; message: string }) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5 mt-1">
      {status === 'checking' && <Loader2 size={12} className="text-text-muted animate-spin" />}
      {status === 'valid' && <Check size={12} className="text-emerald-400" />}
      {status === 'invalid' && <X size={12} className="text-red-400" />}
      <span className={`text-xs ${
        status === 'valid' ? 'text-emerald-400' :
        status === 'invalid' ? 'text-red-400' :
        'text-text-muted'
      }`}>
        {status === 'checking' ? 'Kontrollerar...' : message}
      </span>
    </div>
  );
}

export default function ProfileSettings() {
  const { profile, updateProfile, resetProfile } = useProfile();
  const [showReset, setShowReset] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvResult, setCvResult] = useState<string | null>(null);

  const linkedinValidation = useLinkedInValidation(profile.linkedin);
  const githubValidation = useGitHubValidation(profile.github);
  const portfolioValidation = useUrlValidation(profile.portfolio);
  const cvValidation = useUrlValidation(profile.cvUrl);

  const findCV = async () => {
    if (!profile.portfolio) return;
    setCvLoading(true);
    setCvResult(null);
    try {
      const url = profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`;
      const res = await fetch('/api/find-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.found && data.cvUrl) {
        updateProfile({ cvUrl: data.cvUrl });
        setCvResult(`Hittade CV: ${data.cvUrl}`);
      } else {
        setCvResult('Hittade inget CV automatiskt.');
      }
    } catch {
      setCvResult('Kunde inte söka – klistra in CV-länk manuellt.');
    } finally {
      setCvLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-6 space-y-5"
    >
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-pink-600 mx-auto flex items-center justify-center mb-3">
          <span className="text-white font-display font-bold text-2xl">
            {profile.name ? profile.name[0].toUpperCase() : '?'}
          </span>
        </div>
        <h2 className="font-display font-bold text-xl">{profile.name || 'Ingen profil'}</h2>
      </div>

      {/* Name */}
      <FieldCard
        icon={<User size={18} />}
        label="Förnamn"
        value={profile.name}
        onChange={(v) => updateProfile({ name: v })}
        placeholder="Ditt förnamn"
      />

      {/* LinkedIn */}
      <FieldCard
        icon={<Linkedin size={18} />}
        label="LinkedIn"
        value={profile.linkedin}
        onChange={(v) => updateProfile({ linkedin: v })}
        placeholder="ditt-namn"
        prefix="linkedin.com/in/"
        validation={linkedinValidation}
      />

      {/* Portfolio */}
      <FieldCard
        icon={<Globe size={18} />}
        label="Portfolio"
        value={profile.portfolio}
        onChange={(v) => updateProfile({ portfolio: v })}
        placeholder="dinportfolio.se"
        validation={portfolioValidation}
      />

      {/* GitHub */}
      <FieldCard
        icon={<Github size={18} />}
        label="GitHub"
        value={profile.github}
        onChange={(v) => updateProfile({ github: v })}
        placeholder="ditt-username"
        prefix="github.com/"
        validation={githubValidation}
      />

      {/* CV */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-gold" />
          <span className="font-display font-semibold text-sm">CV-länk</span>
        </div>
        <div className={`border ${
          cvValidation.status === 'valid' ? 'border-emerald-500/50' :
          cvValidation.status === 'invalid' ? 'border-red-500/50' :
          'border-border/50'
        } rounded-xl overflow-hidden transition-colors`}>
          <input
            type="url"
            value={profile.cvUrl}
            onChange={(e) => updateProfile({ cvUrl: e.target.value })}
            placeholder="Länk till CV (Google Drive, Dropbox, etc.)"
            className="w-full bg-bg/50 px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none min-h-[44px]"
          />
        </div>
        {profile.cvUrl && (
          <ValidationBadge status={cvValidation.status} message={cvValidation.message} />
        )}
        {profile.portfolio && (
          <button
            onClick={findCV}
            disabled={cvLoading}
            className="mt-3 w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-muted hover:text-primary hover:border-primary/30 transition-all min-h-[44px] disabled:opacity-50"
          >
            {cvLoading ? 'Söker...' : 'Hitta CV från din portfolio'}
          </button>
        )}
        {cvResult && (
          <p className={`mt-2 text-xs ${cvResult.includes('Hittade CV') ? 'text-emerald-400' : 'text-text-muted'}`}>
            {cvResult}
          </p>
        )}
      </div>

      {/* Reset */}
      <div className="pt-4">
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all min-h-[44px]"
          >
            <Trash2 size={16} />
            Återställ all data
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-3">
            <p className="text-red-400 text-sm font-medium">Är du säker? All data raderas.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface border border-border min-h-[44px]"
              >
                Avbryt
              </button>
              <button
                onClick={() => { resetProfile(); setShowReset(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white min-h-[44px]"
              >
                Radera allt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div className="pt-2 pb-6 text-center">
        <div className="flex items-center justify-center gap-1.5 text-text-muted/50 text-xs">
          <Info size={12} />
          <span>GÖSTA Prep 2026 – Byggd av NBI .NET-klassen</span>
        </div>
      </div>
    </motion.div>
  );
}

function FieldCard({
  icon,
  label,
  value,
  onChange,
  placeholder,
  prefix,
  validation,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  prefix?: string;
  validation?: { status: ValidationStatus; message: string };
}) {
  const [editing, setEditing] = useState(false);

  const borderClass = validation && editing
    ? validation.status === 'valid' ? 'border-emerald-500/50'
    : validation.status === 'invalid' ? 'border-red-500/50'
    : 'border-border/50'
    : 'border-border/50';

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">{icon}</span>
          <span className="font-display font-semibold text-sm">{label}</span>
          {!editing && value && validation?.status === 'valid' && (
            <Check size={14} className="text-emerald-400" />
          )}
          {!editing && value && validation?.status === 'invalid' && (
            <X size={14} className="text-red-400" />
          )}
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-primary text-xs font-medium min-w-[44px] min-h-[44px] flex items-center justify-center -m-2"
        >
          {editing ? 'Klar' : 'Ändra'}
        </button>
      </div>
      {editing ? (
        <div>
          <div className={`flex items-center border ${borderClass} rounded-xl overflow-hidden transition-colors`}>
            {prefix && <span className="text-text-muted text-sm shrink-0 pl-3">{prefix}</span>}
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="flex-1 bg-bg/50 px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none min-h-[44px]"
            />
            {validation?.status === 'valid' && (
              <Check size={16} className="text-emerald-400 mr-3 shrink-0" />
            )}
            {validation?.status === 'checking' && (
              <Loader2 size={16} className="text-text-muted animate-spin mr-3 shrink-0" />
            )}
          </div>
          {validation && value && (
            <ValidationBadge status={validation.status} message={validation.message} />
          )}
        </div>
      ) : (
        <p className="text-text-muted text-sm">
          {value ? (prefix ? `${prefix}${value}` : value) : <span className="italic">Inte ifylld</span>}
        </p>
      )}
    </div>
  );
}
