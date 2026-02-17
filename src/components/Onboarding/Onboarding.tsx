import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Linkedin, Globe, Github, FileText, Rocket, Check, Sparkles, X, Loader2, Upload, Radar, Search, User } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { useProfile } from '../../hooks/useProfile';
import { useGitHubValidation, useLinkedInValidation, useUrlValidation, type ValidationStatus } from '../../hooks/useFieldValidation';

const steps = ['welcome', 'portfolio', 'name', 'linkedin', 'github', 'cv', 'done'] as const;
type Step = typeof steps[number];

function ValidationBadge({ status, message }: { status: ValidationStatus; message: string }) {
  if (status === 'idle') return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {status === 'checking' && <Loader2 size={14} className="text-text-muted animate-spin" />}
      {status === 'valid' && <Check size={14} className="text-success" />}
      {status === 'invalid' && <X size={14} className="text-error" />}
      <span className={`text-xs ${
        status === 'valid' ? 'text-success' : status === 'invalid' ? 'text-error' : 'text-text-muted'
      }`}>
        {status === 'checking' ? 'Kontrollerar...' : message}
      </span>
    </div>
  );
}

function validationBorderClass(status: ValidationStatus): string {
  if (status === 'valid') return 'border-success/50';
  if (status === 'invalid') return 'border-error/50';
  return 'border-border-subtle';
}

function PrimaryButton({ onClick, disabled, children, fullWidth }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full max-w-[400px] mx-auto' : 'flex-1'} font-semibold py-4 rounded-xl text-base min-h-[52px] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2`}
      style={{
        background: disabled ? '#3a3a5a' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        boxShadow: disabled ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.3)',
      }}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-4 rounded-[10px] bg-glass border border-glass-border hover:bg-glass-hover min-w-[52px] min-h-[52px] flex items-center justify-center transition-colors">
      <ArrowLeft size={18} className="text-text-muted" />
    </button>
  );
}

export default function Onboarding() {
  const { profile, updateProfile } = useProfile();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(profile.name);
  const [linkedin, setLinkedin] = useState(profile.linkedin);
  const [portfolio, setPortfolio] = useState(profile.portfolio);
  const [github, setGithub] = useState(profile.github);
  const [cvUrl, setCvUrl] = useState(profile.cvUrl);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvResult, setCvResult] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [scanDone, setScanDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const linkedinValidation = useLinkedInValidation(linkedin);
  const githubValidation = useGitHubValidation(github);
  const portfolioValidation = useUrlValidation(portfolio);
  const cvValidation = useUrlValidation(cvUrl);

  const currentIndex = steps.indexOf(step);

  const next = () => {
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const finish = () => {
    updateProfile({
      name,
      linkedin,
      portfolio,
      github,
      cvUrl,
      onboardingComplete: true,
    });
  };

  const scanPortfolio = async () => {
    if (!portfolio) return;
    setScanning(true);
    setScanResults([]);
    setScanDone(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const url = portfolio.startsWith('http') ? portfolio : `https://${portfolio}`;
      const res = await fetch('/api/scan-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      const data = await res.json();

      const results: string[] = [];
      if (data.name && !name) {
        setName(data.name);
        results.push(`+Namn: ${data.name}`);
      } else if (!data.name && !name) {
        results.push(`-Hittade inte namn`);
      }
      if (data.linkedin && !linkedin) {
        setLinkedin(data.linkedin);
        results.push(`+LinkedIn: ${data.linkedin}`);
      } else if (!data.linkedin && !linkedin) {
        results.push(`-Hittade inte LinkedIn`);
      }
      if (data.github && !github) {
        setGithub(data.github);
        results.push(`+GitHub: ${data.github}`);
      } else if (!data.github && !github) {
        results.push(`-Hittade inte GitHub`);
      }
      if (data.cvUrl && !cvUrl) {
        setCvUrl(data.cvUrl);
        results.push('+CV-länk hittad');
      } else if (!data.cvUrl && !cvUrl) {
        results.push('-Hittade inte CV');
      }

      setScanResults(results);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setScanResults(['-Det tog för lång tid — fyll i manuellt']);
      } else {
        setScanResults(['-Kunde inte nå hemsidan – fyll i manuellt']);
      }
    } finally {
      clearTimeout(timeout);
      setScanning(false);
      setScanDone(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (file.size > MAX_SIZE) { setCvResult('too-large'); return; }
    if (!ALLOWED.includes(file.type)) { setCvResult('bad-type'); return; }

    setCvLoading(true);
    setCvResult(null);
    setCvFileName(file.name);
    try {
      const blob = await upload(`cv/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-cv',
      });
      setCvUrl(blob.url);
      setCvResult('uploaded');
    } catch (err) {
      console.error('CV upload failed:', err);
      setCvResult('upload-error');
    } finally {
      setCvLoading(false);
    }
  };

  const canProceedLinkedin = !linkedin || linkedinValidation.status !== 'invalid';
  const canProceedGithub = !github || githubValidation.status !== 'invalid';
  const canProceedPortfolio = !portfolio || portfolioValidation.status !== 'invalid';
  const canProceedCv = !cvUrl || cvValidation.status !== 'invalid';

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-dvh bg-bg flex flex-col" style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)' }}>
      {/* Progress bar */}
      {step !== 'welcome' && step !== 'done' && (
        <div className="px-6 pt-4">
          <div className="flex gap-1.5">
            {steps.slice(1, -1).map((s, i) => (
              <div
                key={s}
                className={`h-0.5 rounded-full flex-1 transition-all duration-500 ${
                  i < currentIndex - 1
                    ? 'bg-primary'
                    : i === currentIndex - 1
                      ? 'bg-primary'
                      : 'bg-border-subtle'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm"
          >
            {/* ---- WELCOME ---- */}
            {step === 'welcome' && (
              <div className="text-center space-y-8">
                <motion.div
                  className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)' }}
                  animate={{ boxShadow: ['0 0 20px rgba(99, 102, 241, 0.2)', '0 0 40px rgba(99, 102, 241, 0.4)', '0 0 20px rgba(99, 102, 241, 0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Rocket size={36} className="text-white" />
                </motion.div>
                <div>
                  <h1 className="font-bold text-3xl mb-3">
                    <span className="text-primary">GÖSTA</span> Prep 2026
                  </h1>
                  <p className="text-text-muted text-[15px] leading-relaxed max-w-[300px] mx-auto">
                    Ditt hemliga vapen på mässdagen. Företagsinfo, ice-breakers, QR-koder och schema – allt i fickan.
                  </p>
                </div>
                <PrimaryButton onClick={next} fullWidth>
                  Kom igång <ArrowRight size={18} />
                </PrimaryButton>
              </div>
            )}

            {/* ---- PORTFOLIO (first!) ---- */}
            {step === 'portfolio' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Globe size={24} className="text-success" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[22px]">Portfolio</h2>
                    <p className="text-text-muted text-xs">Vi skannar din sida och fyller i resten</p>
                  </div>
                </div>
                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(portfolioValidation.status)} rounded-[10px] overflow-hidden transition-colors`}>
                    <input
                      type="url"
                      value={portfolio}
                      onChange={(e) => { setPortfolio(e.target.value); setScanDone(false); setScanResults([]); }}
                      placeholder="dinportfolio.se"
                      autoFocus={!portfolio}
                      className="flex-1 bg-transparent px-5 py-4 text-[15px] text-text placeholder:text-text-muted focus:outline-none min-h-[48px]"
                    />
                    {portfolio && portfolioValidation.status === 'valid' && !scanning && (
                      <Check size={18} className="text-success mr-4 shrink-0" />
                    )}
                  </div>
                  <ValidationBadge status={portfolioValidation.status === 'valid' ? 'idle' : portfolioValidation.status} message={portfolioValidation.message} />
                </div>

                {portfolio && portfolioValidation.status === 'valid' && (
                  <div className="space-y-3">
                    <motion.button
                      onClick={scanPortfolio}
                      disabled={scanning}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative overflow-hidden rounded-xl min-h-[56px] flex items-center justify-center gap-3 text-sm font-semibold text-white disabled:opacity-80 transition-all"
                      style={{
                        background: scanning
                          ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)'
                          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                        boxShadow: scanning
                          ? '0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)'
                          : '0 4px 20px rgba(99, 102, 241, 0.35)',
                      }}
                    >
                      {/* Animated scan line */}
                      {scanning && (
                        <motion.div
                          className="absolute inset-0 opacity-30"
                          style={{
                            background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                            height: '30%',
                          }}
                          animate={{ top: ['-30%', '130%'] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                      {/* Shimmer when idle */}
                      {!scanning && !scanDone && (
                        <motion.div
                          className="absolute inset-0 opacity-20"
                          style={{
                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                          }}
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {scanning ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <Radar size={18} />
                            </motion.div>
                            Skannar {portfolio}...
                          </>
                        ) : scanDone ? (
                          <><Search size={18} /> Skanna igen</>
                        ) : (
                          <><Radar size={18} /> Skanna min hemsida</>
                        )}
                      </span>
                    </motion.button>
                    {!scanDone && (
                      <div className="flex items-center gap-2 justify-center px-2">
                        <div className="flex gap-1">
                          <Linkedin size={11} className="text-text-dim" />
                          <Github size={11} className="text-text-dim" />
                          <FileText size={11} className="text-text-dim" />
                        </div>
                        <p className="text-text-dim text-[11px]">
                          Hittar namn, LinkedIn, GitHub och CV automatiskt
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {scanResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-glass-border rounded-xl p-3.5 space-y-2"
                    style={{ background: 'rgba(99, 102, 241, 0.05)' }}
                  >
                    <p className="text-[10px] font-medium text-text-dim uppercase tracking-wider mb-1">Skanningsresultat</p>
                    {scanResults.map((r, i) => {
                      const isFound = r.startsWith('+');
                      const text = r.slice(1);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          {isFound ? (
                            <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                              <Check size={10} className="text-success" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                              <X size={10} className="text-error" />
                            </div>
                          )}
                          <span className={`font-medium ${isFound ? 'text-success' : 'text-text-dim'}`}>{text}</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <BackButton onClick={prev} />
                  <PrimaryButton onClick={next} disabled={!canProceedPortfolio || scanning}>
                    {portfolio ? 'Nästa' : 'Hoppa över'}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ---- NAME ---- */}
            {step === 'name' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold text-[22px] mb-2">Vad heter du?</h2>
                  <p className="text-text-muted text-sm">
                    {name ? 'Stämmer detta?' : 'Ditt förnamn räcker'}
                  </p>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Förnamn"
                  autoFocus={!name}
                  className="w-full bg-surface border border-border-subtle rounded-[10px] px-5 py-4 text-lg text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow min-h-[48px] transition-all"
                />
                {name && scanDone && (
                  <p className="text-success text-xs flex items-center gap-1.5">
                    <Check size={12} /> Ifyllt från din hemsida
                  </p>
                )}
                <div className="flex gap-3">
                  <BackButton onClick={prev} />
                  <PrimaryButton onClick={next} disabled={!name.trim()}>
                    Nästa <ArrowRight size={18} />
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ---- LINKEDIN ---- */}
            {step === 'linkedin' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Linkedin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[22px]">LinkedIn</h2>
                    <p className="text-text-muted text-xs">Så rekryterare kan scanna din QR-kod</p>
                  </div>
                </div>
                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(linkedinValidation.status)} rounded-[10px] overflow-hidden transition-colors`}>
                    <span className="text-text-dim text-sm pl-4 shrink-0">linkedin.com/in/</span>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="ditt-namn"
                      autoFocus={!linkedin}
                      className="flex-1 bg-transparent px-2 py-4 text-text text-[15px] placeholder:text-text-muted focus:outline-none min-h-[48px]"
                    />
                    {linkedin && linkedinValidation.status === 'valid' && (
                      <Check size={18} className="text-success mr-4 shrink-0" />
                    )}
                  </div>
                  <ValidationBadge status={linkedinValidation.status === 'valid' ? 'idle' : linkedinValidation.status} message={linkedinValidation.message} />
                </div>
                {linkedin && scanDone && (
                  <p className="text-success text-xs flex items-center gap-1.5">
                    <Check size={12} /> Hittad på din hemsida
                  </p>
                )}
                {!linkedin && (
                  <p className="text-text-dim text-xs">Öppna LinkedIn-appen, gå till din profil och kopiera din URL</p>
                )}
                <div className="flex gap-3">
                  <BackButton onClick={prev} />
                  <PrimaryButton onClick={next} disabled={!canProceedLinkedin}>
                    {linkedin ? 'Nästa' : 'Hoppa över'}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ---- GITHUB ---- */}
            {step === 'github' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-glass border border-glass-border flex items-center justify-center">
                    <Github size={24} className="text-text" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[22px]">GitHub</h2>
                    <p className="text-text-muted text-xs">Visa dina repositories</p>
                  </div>
                </div>
                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(githubValidation.status)} rounded-[10px] overflow-hidden transition-colors`}>
                    <span className="text-text-dim text-sm pl-4 shrink-0">github.com/</span>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="ditt-username"
                      autoFocus={!github}
                      className="flex-1 bg-transparent px-2 py-4 text-text text-[15px] placeholder:text-text-muted focus:outline-none min-h-[48px]"
                    />
                    {github && githubValidation.status === 'valid' && (
                      <Check size={18} className="text-success mr-4 shrink-0" />
                    )}
                    {github && githubValidation.status === 'checking' && (
                      <Loader2 size={18} className="text-text-muted animate-spin mr-4 shrink-0" />
                    )}
                  </div>
                  <ValidationBadge
                    status={githubValidation.status === 'valid' ? 'idle' : githubValidation.status}
                    message={githubValidation.message}
                  />
                  {githubValidation.status === 'valid' && (
                    <p className="text-success text-xs mt-1.5 flex items-center gap-1.5">
                      <Check size={14} /> Hittade: {githubValidation.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <BackButton onClick={prev} />
                  <PrimaryButton onClick={next} disabled={!canProceedGithub || githubValidation.status === 'checking'}>
                    {github ? 'Nästa' : 'Hoppa över'}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ---- CV ---- */}
            {step === 'cv' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                    <FileText size={24} className="text-gold" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[22px]">CV</h2>
                    <p className="text-text-muted text-xs">Ladda upp eller klistra in en länk</p>
                  </div>
                </div>

                {cvUrl && scanDone && cvResult !== 'uploaded' && (
                  <div className="bg-success/5 border border-success/30 rounded-[10px] px-4 py-3 text-sm text-success flex items-center gap-2">
                    <Check size={16} />
                    <span className="truncate">CV hittad: {cvUrl}</span>
                  </div>
                )}

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
                  className={`w-full border border-dashed rounded-[10px] px-4 py-5 text-sm font-medium transition-all min-h-[64px] flex flex-col items-center justify-center gap-2 ${
                    cvResult === 'uploaded'
                      ? 'border-success/50 bg-success/5 text-success'
                      : 'border-glass-border hover:border-primary/40 hover:bg-glass text-text-muted hover:text-primary'
                  } disabled:opacity-50`}
                >
                  {cvLoading ? (
                    <><Loader2 size={22} className="animate-spin" /><span>Laddar upp...</span></>
                  ) : cvResult === 'uploaded' ? (
                    <><Check size={22} /><span>Uppladdad: {cvFileName}</span></>
                  ) : (
                    <><Upload size={22} /><span>Ladda upp CV (PDF, Word)</span></>
                  )}
                </button>

                {cvResult === 'upload-error' && (
                  <p className="text-error text-xs text-center">Uppladdningen misslyckades. Prova att klistra in en länk istället.</p>
                )}
                {cvResult === 'too-large' && (
                  <p className="text-error text-xs text-center">Filen är för stor (max 10 MB).</p>
                )}
                {cvResult === 'bad-type' && (
                  <p className="text-error text-xs text-center">Bara PDF och Word-dokument stöds.</p>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border-subtle" />
                  <span className="text-text-dim text-xs">eller klistra in länk</span>
                  <div className="flex-1 h-px bg-border-subtle" />
                </div>

                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(cvValidation.status)} rounded-[10px] overflow-hidden transition-colors`}>
                    <input
                      type="url"
                      value={cvUrl}
                      onChange={(e) => { setCvUrl(e.target.value); setCvResult(null); }}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 bg-transparent px-5 py-4 text-[15px] text-text placeholder:text-text-muted focus:outline-none min-h-[48px]"
                    />
                    {cvUrl && cvValidation.status === 'valid' && (
                      <Check size={18} className="text-success mr-4 shrink-0" />
                    )}
                  </div>
                  <ValidationBadge status={cvValidation.status === 'valid' ? 'idle' : cvValidation.status} message={cvValidation.message} />
                </div>

                <div className="flex gap-3">
                  <BackButton onClick={prev} />
                  <PrimaryButton onClick={next} disabled={!canProceedCv}>
                    {cvUrl ? 'Nästa' : 'Hoppa över'}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ---- DONE ---- */}
            {step === 'done' && (
              <div className="text-center space-y-6">
                <div
                  className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' }}
                >
                  <Sparkles size={36} className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl mb-2">Du är redo, {name}!</h1>
                  <p className="text-text-muted text-[15px] leading-relaxed max-w-[300px] mx-auto">
                    Dags att krossa GÖSTA 2026. Kolla in företagen, förbered dina ice-breakers och visa dina QR-koder.
                  </p>
                </div>
                <div className="bg-glass border border-glass-border rounded-xl p-4 text-left space-y-3">
                  <SummaryBadge icon={<User size={14} />} label="Namn" value={name} configured={!!name} />
                  <SummaryBadge icon={<Globe size={14} />} label="Portfolio" value={portfolio || ''} configured={!!portfolio} mono />
                  <SummaryBadge icon={<Linkedin size={14} />} label="LinkedIn" value={linkedin ? `linkedin.com/in/${linkedin}` : ''} configured={!!linkedin} mono />
                  <SummaryBadge icon={<Github size={14} />} label="GitHub" value={github ? `github.com/${github}` : ''} configured={!!github} mono />
                  <SummaryBadge icon={<FileText size={14} />} label="CV" value={cvUrl ? 'Bifogat' : ''} configured={!!cvUrl} unconfiguredLabel="Inte bifogat" />
                </div>
                <PrimaryButton onClick={finish} fullWidth>
                  Starta appen <ArrowRight size={18} />
                </PrimaryButton>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SummaryBadge({ icon, label, value, configured, mono, unconfiguredLabel }: { icon: React.ReactNode; label: string; value: string; configured: boolean; mono?: boolean; unconfiguredLabel?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${configured ? 'bg-success/20 text-success' : 'bg-glass text-text-dim'}`}>
        {configured ? icon : <span className="w-1.5 h-1.5 rounded-full bg-text-dim" />}
      </div>
      <span className="text-text-muted text-sm w-16 shrink-0">{label}</span>
      <span className={`text-sm truncate ${configured ? 'text-text' : 'text-text-dim italic'} ${mono && configured ? 'font-mono text-xs' : 'font-medium'}`}>
        {configured ? value : (unconfiguredLabel || 'Ej ifylld')}
      </span>
    </div>
  );
}
