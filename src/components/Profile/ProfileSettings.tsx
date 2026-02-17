import { useState, useRef } from 'react';
import { User, Linkedin, Globe, Github, FileText, Trash2, Info, Check, X, Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { upload } from '@vercel/blob/client';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const linkedinValidation = useLinkedInValidation(profile.linkedin);
  const githubValidation = useGitHubValidation(profile.github);
  const portfolioValidation = useUrlValidation(profile.portfolio);
  const cvValidation = useUrlValidation(profile.cvUrl);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvLoading(true);
    setCvResult(null);

    try {
      const blob = await upload(`cv/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-cv',
      });
      updateProfile({ cvUrl: blob.url });
      setCvResult(`Uppladdad: ${file.name}`);
    } catch (err) {
      console.error('CV upload failed:', err);
      setCvResult('Uppladdningen misslyckades.');
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
      <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-gold" />
          <span className="font-display font-semibold text-sm">CV</span>
          {profile.cvUrl && cvValidation.status === 'valid' && (
            <Check size={14} className="text-emerald-400" />
          )}
        </div>

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={cvLoading}
          className="w-full border-2 border-dashed border-border hover:border-primary/40 rounded-xl px-4 py-3 text-sm font-medium text-text-muted hover:text-primary transition-all min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {cvLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Laddar upp...</>
          ) : (
            <><Upload size={16} /> Ladda upp CV (PDF, Word)</>
          )}
        </button>

        {/* URL input */}
        <div className={`border ${
          cvValidation.status === 'valid' ? 'border-emerald-500/50' :
          cvValidation.status === 'invalid' ? 'border-red-500/50' :
          'border-border/50'
        } rounded-xl overflow-hidden transition-colors`}>
          <input
            type="url"
            value={profile.cvUrl}
            onChange={(e) => updateProfile({ cvUrl: e.target.value })}
            placeholder="Eller klistra in länk till CV"
            className="w-full bg-bg/50 px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none min-h-[44px]"
          />
        </div>
        {profile.cvUrl && (
          <ValidationBadge status={cvValidation.status} message={cvValidation.message} />
        )}
        {cvResult && (
          <p className={`mt-2 text-xs ${cvResult.includes('Uppladdad') ? 'text-emerald-400' : 'text-red-400'}`}>
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
