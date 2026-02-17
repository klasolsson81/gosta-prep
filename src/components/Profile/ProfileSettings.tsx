import { useState, useRef } from 'react';
import { User, Linkedin, Globe, Github, FileText, Trash2, Info, Check, X, Loader2, Upload, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { upload } from '@vercel/blob/client';
import { useProfile } from '../../hooks/useProfile';
import { useGitHubValidation, useLinkedInValidation, useUrlValidation, type ValidationStatus } from '../../hooks/useFieldValidation';

function extractCvFilename(url: string): string | null {
  if (!url) return null;
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/');
    const last = segments[segments.length - 1];
    if (!last) return null;
    // Remove timestamp prefix like "1234567890-"
    const cleaned = last.replace(/^\d+-/, '');
    if (cleaned.match(/\.(pdf|doc|docx)$/i)) return decodeURIComponent(cleaned);
    return null;
  } catch {
    return null;
  }
}

function ValidationBadge({ status, message }: { status: ValidationStatus; message: string }) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5 mt-1">
      {status === 'checking' && <Loader2 size={12} className="text-text-muted animate-spin" />}
      {status === 'valid' && <Check size={12} className="text-success" />}
      {status === 'invalid' && <X size={12} className="text-error" />}
      <span className={`text-xs ${
        status === 'valid' ? 'text-success' :
        status === 'invalid' ? 'text-error' :
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
  const [showCvUrl, setShowCvUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const linkedinValidation = useLinkedInValidation(profile.linkedin);
  const githubValidation = useGitHubValidation(profile.github);
  const portfolioValidation = useUrlValidation(profile.portfolio);
  const cvValidation = useUrlValidation(profile.cvUrl);

  const cvFilename = extractCvFilename(profile.cvUrl);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (file.size > MAX_SIZE) { setCvResult('Filen är för stor (max 10 MB).'); return; }
    if (!ALLOWED.includes(file.type)) { setCvResult('Bara PDF och Word-dokument stöds.'); return; }

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="px-4 py-6 space-y-0"
    >
      {/* Avatar + Name */}
      <div className="text-center mb-6">
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)',
          }}
        >
          <span className="text-white font-semibold text-[28px]">
            {profile.name ? profile.name[0].toUpperCase() : '?'}
          </span>
        </div>
        <h2 className="font-semibold text-xl">{profile.name || 'Ingen profil'}</h2>
      </div>

      {/* Fields */}
      <div className="space-y-px bg-glass border border-glass-border rounded-xl overflow-hidden">
        <FieldRow
          icon={<User size={16} />}
          label="Förnamn"
          value={profile.name}
          onChange={(v) => updateProfile({ name: v })}
          placeholder="Ditt förnamn"
        />
        <FieldRow
          icon={<Linkedin size={16} />}
          label="LinkedIn"
          value={profile.linkedin}
          onChange={(v) => updateProfile({ linkedin: v })}
          placeholder="ditt-namn"
          prefix="linkedin.com/in/"
          validation={linkedinValidation}
        />
        <FieldRow
          icon={<Globe size={16} />}
          label="Portfolio"
          value={profile.portfolio}
          onChange={(v) => updateProfile({ portfolio: v })}
          placeholder="dinportfolio.se"
          validation={portfolioValidation}
        />
        <FieldRow
          icon={<Github size={16} />}
          label="GitHub"
          value={profile.github}
          onChange={(v) => updateProfile({ github: v })}
          placeholder="ditt-username"
          prefix="github.com/"
          validation={githubValidation}
        />
      </div>

      {/* CV Section */}
      <div className="mt-4 bg-glass border border-glass-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gold" />
            <span className="font-medium text-sm">CV</span>
          </div>
          {profile.cvUrl && (
            <button
              onClick={() => setShowCvUrl(!showCvUrl)}
              className="text-primary text-xs font-medium min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              Ändra
            </button>
          )}
        </div>

        {/* Show filename if CV exists */}
        {profile.cvUrl && cvValidation.status !== 'invalid' && !showCvUrl && (
          <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-[10px] px-4 py-3">
            <Check size={14} className="text-success shrink-0" />
            <span className="text-sm text-text truncate font-medium">
              {cvFilename || 'CV tillagd'}
            </span>
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs font-medium shrink-0 ml-auto"
            >
              Öppna
            </a>
          </div>
        )}

        {/* Upload / URL input (shown when no CV or editing) */}
        {(!profile.cvUrl || showCvUrl) && (
          <>
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
              className="w-full border border-dashed border-glass-border hover:border-primary/40 rounded-[10px] px-4 py-3 text-sm font-medium text-text-muted hover:text-primary transition-all min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cvLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Laddar upp...</>
              ) : (
                <><Upload size={16} /> Ladda upp CV (PDF, Word)</>
              )}
            </button>

            <div className={`border ${
              cvValidation.status === 'valid' ? 'border-success/50' :
              cvValidation.status === 'invalid' ? 'border-error/50' :
              'border-border-subtle'
            } rounded-[10px] overflow-hidden transition-colors`}>
              <input
                type="url"
                value={profile.cvUrl}
                onChange={(e) => updateProfile({ cvUrl: e.target.value })}
                placeholder="Eller klistra in länk till CV"
                className="w-full bg-bg px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:shadow-glow min-h-[44px]"
              />
            </div>
            {profile.cvUrl && (
              <ValidationBadge status={cvValidation.status} message={cvValidation.message} />
            )}
          </>
        )}
        {cvResult && (
          <p className={`text-xs ${cvResult.includes('Uppladdad') ? 'text-success' : 'text-error'}`}>
            {cvResult}
          </p>
        )}
      </div>

      {/* Share */}
      <div className="mt-4">
        <button
          onClick={async () => {
            const shareData = {
              title: 'GÖSTA Prep 2026',
              text: 'Förbered dig för GÖSTA 2026 med GÖSTA Prep!',
              url: 'https://gostaprep.se',
            };
            try {
              if (navigator.share) {
                await navigator.share(shareData);
              } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert('Länk kopierad!');
              }
            } catch {
              // User cancelled share
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm font-medium bg-glass border border-glass-border text-text-muted hover:text-text hover:bg-glass-hover transition-all min-h-[44px]"
        >
          <Share2 size={16} />
          Dela appen med klassen
        </button>
      </div>

      {/* Reset */}
      <div className="pt-6">
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm font-medium text-error/60 hover:text-error hover:bg-error/5 transition-all min-h-[44px]"
          >
            <Trash2 size={16} />
            Återställ all data
          </button>
        ) : (
          <div className="bg-error/5 border border-error/20 rounded-xl p-4 text-center space-y-3">
            <p className="text-error text-sm font-medium">Är du säker? All data raderas.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-[10px] text-sm font-medium bg-glass border border-glass-border min-h-[44px]"
              >
                Avbryt
              </button>
              <button
                onClick={() => { resetProfile(); setShowReset(false); }}
                className="flex-1 py-2.5 rounded-[10px] text-sm font-medium bg-error text-white min-h-[44px]"
              >
                Radera allt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 pb-6 text-center">
        <div className="flex items-center justify-center gap-1.5 text-text-dim text-xs">
          <Info size={12} />
          <span>GÖSTA Prep 2026 – Byggd av NBI .NET-klassen</span>
        </div>
      </div>
    </motion.div>
  );
}

function FieldRow({
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

  return (
    <div className="px-4 py-3 border-b border-glass-border last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-text-dim shrink-0">{icon}</span>
          <div className="min-w-0 flex-1">
            <span className="text-[12px] font-medium text-text-dim uppercase tracking-wider">{label}</span>
            {editing ? (
              <div className="mt-1">
                <div className={`flex items-center bg-bg border ${
                  validation?.status === 'valid' ? 'border-success/50' :
                  validation?.status === 'invalid' ? 'border-error/50' :
                  'border-border-subtle'
                } rounded-lg overflow-hidden transition-colors`}>
                  {prefix && <span className="text-text-dim text-xs shrink-0 pl-3">{prefix}</span>}
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none min-h-[36px]"
                  />
                  {validation?.status === 'valid' && <Check size={14} className="text-success mr-3 shrink-0" />}
                  {validation?.status === 'checking' && <Loader2 size={14} className="text-text-muted animate-spin mr-3 shrink-0" />}
                </div>
                {validation && value && (
                  <ValidationBadge status={validation.status} message={validation.message} />
                )}
              </div>
            ) : (
              <p className="text-sm text-text truncate">
                {value ? (prefix ? `${prefix}${value}` : value) : <span className="text-text-dim italic">Inte ifylld</span>}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-primary text-xs font-medium min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
        >
          {editing ? 'Klar' : 'Ändra'}
        </button>
      </div>
    </div>
  );
}
