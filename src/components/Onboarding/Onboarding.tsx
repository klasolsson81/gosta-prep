import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Linkedin, Globe, Github, FileText, Rocket, Check, Sparkles, X, Loader2, Upload, Search } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { useProfile } from '../../hooks/useProfile';
import { useGitHubValidation, useLinkedInValidation, useUrlValidation, type ValidationStatus } from '../../hooks/useFieldValidation';

// Portfolio first so we can scan and pre-fill everything
const steps = ['welcome', 'portfolio', 'name', 'linkedin', 'github', 'cv', 'done'] as const;
type Step = typeof steps[number];

function ValidationBadge({ status, message }: { status: ValidationStatus; message: string }) {
  if (status === 'idle') return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {status === 'checking' && <Loader2 size={14} className="text-text-muted animate-spin" />}
      {status === 'valid' && <Check size={14} className="text-emerald-400" />}
      {status === 'invalid' && <X size={14} className="text-red-400" />}
      <span className={`text-xs ${
        status === 'valid' ? 'text-emerald-400' : status === 'invalid' ? 'text-red-400' : 'text-text-muted'
      }`}>
        {status === 'checking' ? 'Kontrollerar...' : message}
      </span>
    </div>
  );
}

function validationBorderClass(status: ValidationStatus): string {
  if (status === 'valid') return 'border-emerald-500/50';
  if (status === 'invalid') return 'border-red-500/50';
  return 'border-border';
}

export default function Onboarding() {
  const { profile } = useProfile();
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
    const fullProfile = {
      ...profile,
      name,
      linkedin,
      portfolio,
      github,
      cvUrl,
      onboardingComplete: true,
    };
    window.localStorage.setItem('gosta-profile', JSON.stringify(fullProfile));
    window.location.replace('/');
  };

  const scanPortfolio = async () => {
    if (!portfolio) return;
    setScanning(true);
    setScanResults([]);
    setScanDone(false);

    try {
      const url = portfolio.startsWith('http') ? portfolio : `https://${portfolio}`;
      const res = await fetch('/api/scan-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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
    } catch {
      setScanResults(['-Kunde inte nå hemsidan – fyll i manuellt']);
    } finally {
      setScanning(false);
      setScanDone(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* Progress bar */}
      {step !== 'welcome' && step !== 'done' && (
        <div className="px-6 pt-4">
          <div className="flex gap-1.5">
            {steps.slice(1, -1).map((s, i) => (
              <div
                key={s}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  i < currentIndex - 1 ? 'bg-primary' : i === currentIndex - 1 ? 'bg-primary' : 'bg-border'
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
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-pink-600 mx-auto flex items-center justify-center">
                  <Rocket size={36} className="text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-3xl mb-2">GÖSTA Prep 2026</h1>
                  <p className="text-text-muted text-[15px] leading-relaxed">
                    Ditt hemliga vapen på mässdagen. Företagsinfo, ice-breakers, QR-koder och schema – allt i fickan.
                  </p>
                </div>
                <button
                  onClick={next}
                  className="w-full bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] flex items-center justify-center gap-2"
                >
                  Kom igång <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* ---- PORTFOLIO (first!) ---- */}
            {step === 'portfolio' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Globe size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">Portfolio</h2>
                    <p className="text-text-muted text-xs">Vi skannar din sida och fyller i resten</p>
                  </div>
                </div>
                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(portfolioValidation.status)} rounded-2xl overflow-hidden transition-colors`}>
                    <input
                      type="url"
                      value={portfolio}
                      onChange={(e) => { setPortfolio(e.target.value); setScanDone(false); setScanResults([]); }}
                      placeholder="dinportfolio.se"
                      autoFocus
                      className="flex-1 bg-transparent px-5 py-4 text-base text-text placeholder:text-text-muted focus:outline-none min-h-[52px]"
                    />
                    {portfolio && portfolioValidation.status === 'valid' && !scanning && (
                      <Check size={18} className="text-emerald-400 mr-4 shrink-0" />
                    )}
                  </div>
                  <ValidationBadge status={portfolioValidation.status === 'valid' ? 'idle' : portfolioValidation.status} message={portfolioValidation.message} />
                </div>

                {/* Scan button */}
                {portfolio && portfolioValidation.status === 'valid' && (
                  <div className="space-y-2">
                    <button
                      onClick={scanPortfolio}
                      disabled={scanning}
                      className="w-full bg-blue-600/15 border border-blue-500/30 rounded-2xl px-4 py-3.5 text-sm font-medium text-blue-400 hover:bg-blue-600/25 transition-all min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {scanning ? (
                        <><Loader2 size={16} className="animate-spin" /> Skannar {portfolio}...</>
                      ) : scanDone ? (
                        <><Search size={16} /> Skanna igen</>
                      ) : (
                        <><Search size={16} /> Skanna min hemsida</>
                      )}
                    </button>
                    {!scanDone && (
                      <p className="text-text-muted text-xs text-center px-2">
                        Vi läser din hemsida och fyller i namn, LinkedIn, GitHub och CV automatiskt
                      </p>
                    )}
                  </div>
                )}

                {/* Scan results */}
                {scanResults.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-3 space-y-1.5">
                    {scanResults.map((r, i) => {
                      const isFound = r.startsWith('+');
                      const text = r.slice(1);
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {isFound ? (
                            <Check size={12} className="text-emerald-400 shrink-0" />
                          ) : (
                            <X size={12} className="text-red-400 shrink-0" />
                          )}
                          <span className={isFound ? 'text-emerald-400' : 'text-red-400'}>
                            {text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    disabled={!canProceedPortfolio || scanning}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {portfolio ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

            {/* ---- NAME ---- */}
            {step === 'name' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl mb-2">Vad heter du?</h2>
                  <p className="text-text-muted text-sm">
                    {name ? 'Stämmer detta?' : 'Ditt förnamn räcker'}
                  </p>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Förnamn"
                  autoFocus
                  className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-lg text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 min-h-[52px]"
                />
                {name && scanDone && (
                  <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                    <Check size={12} /> Ifyllt från din hemsida
                  </p>
                )}
                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    disabled={!name.trim()}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Nästa <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ---- LINKEDIN ---- */}
            {step === 'linkedin' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Linkedin size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">LinkedIn</h2>
                    <p className="text-text-muted text-xs">Så rekryterare kan scanna din QR-kod</p>
                  </div>
                </div>
                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(linkedinValidation.status)} rounded-2xl overflow-hidden transition-colors`}>
                    <span className="text-text-muted text-sm pl-4 shrink-0">linkedin.com/in/</span>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="ditt-namn"
                      autoFocus
                      className="flex-1 bg-transparent px-2 py-4 text-text text-base placeholder:text-text-muted focus:outline-none min-h-[52px]"
                    />
                    {linkedin && linkedinValidation.status === 'valid' && (
                      <Check size={18} className="text-emerald-400 mr-4 shrink-0" />
                    )}
                  </div>
                  <ValidationBadge status={linkedinValidation.status === 'valid' ? 'idle' : linkedinValidation.status} message={linkedinValidation.message} />
                </div>
                {linkedin && scanDone && (
                  <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                    <Check size={12} /> Hittad på din hemsida
                  </p>
                )}
                {!linkedin && (
                  <p className="text-text-muted text-xs">Öppna LinkedIn-appen, gå till din profil och kopiera din URL</p>
                )}
                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    disabled={!canProceedLinkedin}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {linkedin ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

            {/* ---- GITHUB ---- */}
            {step === 'github' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center">
                    <Github size={22} className="text-text" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">GitHub</h2>
                    <p className="text-text-muted text-xs">Visa dina repositories</p>
                  </div>
                </div>
                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(githubValidation.status)} rounded-2xl overflow-hidden transition-colors`}>
                    <span className="text-text-muted text-sm pl-4 shrink-0">github.com/</span>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="ditt-username"
                      autoFocus
                      className="flex-1 bg-transparent px-2 py-4 text-text text-base placeholder:text-text-muted focus:outline-none min-h-[52px]"
                    />
                    {github && githubValidation.status === 'valid' && (
                      <Check size={18} className="text-emerald-400 mr-4 shrink-0" />
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
                    <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1.5">
                      <Check size={14} /> Hittade: {githubValidation.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    disabled={!canProceedGithub || githubValidation.status === 'checking'}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {github ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

            {/* ---- CV ---- */}
            {step === 'cv' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                    <FileText size={22} className="text-gold" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">CV</h2>
                    <p className="text-text-muted text-xs">Ladda upp eller klistra in en länk</p>
                  </div>
                </div>

                {/* Show if scan found CV */}
                {cvUrl && scanDone && cvResult !== 'uploaded' && (
                  <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
                    <Check size={16} />
                    <span className="truncate">CV hittad: {cvUrl}</span>
                  </div>
                )}

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
                  className={`w-full border-2 border-dashed rounded-2xl px-4 py-5 text-sm font-medium transition-all min-h-[64px] flex flex-col items-center justify-center gap-2 ${
                    cvResult === 'uploaded'
                      ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                      : 'border-border hover:border-primary/40 hover:bg-surface text-text-muted hover:text-primary'
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
                  <p className="text-red-400 text-xs text-center">Uppladdningen misslyckades. Prova att klistra in en länk istället.</p>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-text-muted text-xs">eller klistra in länk</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* URL input */}
                <div>
                  <div className={`flex items-center bg-surface border ${validationBorderClass(cvValidation.status)} rounded-2xl overflow-hidden transition-colors`}>
                    <input
                      type="url"
                      value={cvUrl}
                      onChange={(e) => { setCvUrl(e.target.value); setCvResult(null); }}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 bg-transparent px-5 py-4 text-base text-text placeholder:text-text-muted focus:outline-none min-h-[52px]"
                    />
                    {cvUrl && cvValidation.status === 'valid' && (
                      <Check size={18} className="text-emerald-400 mr-4 shrink-0" />
                    )}
                  </div>
                  <ValidationBadge status={cvValidation.status === 'valid' ? 'idle' : cvValidation.status} message={cvValidation.message} />
                </div>

                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    disabled={!canProceedCv}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {cvUrl ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

            {/* ---- DONE ---- */}
            {step === 'done' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-success to-emerald-600 mx-auto flex items-center justify-center">
                  <Sparkles size={36} className="text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl mb-2">Du är redo, {name}!</h1>
                  <p className="text-text-muted text-[15px] leading-relaxed">
                    Dags att krossa GÖSTA 2026. Kolla in företagen, förbered dina ice-breakers och visa dina QR-koder.
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-4 text-left space-y-2.5">
                  <SummaryRow label="Namn" value={name} />
                  <SummaryRow label="Portfolio" value={portfolio || '–'} />
                  <SummaryRow label="LinkedIn" value={linkedin ? `linkedin.com/in/${linkedin}` : '–'} />
                  <SummaryRow label="GitHub" value={github ? `github.com/${github}` : '–'} />
                  <SummaryRow label="CV" value={cvUrl ? 'Tillagd' : '–'} />
                </div>
                <button
                  onClick={finish}
                  className="w-full bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] flex items-center justify-center gap-2"
                >
                  Starta appen <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-muted text-sm">{label}</span>
      <span className={`text-sm font-medium truncate max-w-[200px] ${value === '–' ? 'text-text-muted' : 'text-text'}`}>{value}</span>
    </div>
  );
}
