import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Linkedin, Globe, Github, FileText, Rocket, Check, Sparkles } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';

const steps = ['welcome', 'name', 'linkedin', 'portfolio', 'github', 'cv', 'done'] as const;
type Step = typeof steps[number];

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

  const findCV = async () => {
    if (!portfolio) return;
    setCvLoading(true);
    setCvResult(null);
    try {
      const url = portfolio.startsWith('http') ? portfolio : `https://${portfolio}`;
      const res = await fetch('/api/find-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.found && data.cvUrl) {
        setCvUrl(data.cvUrl);
        setCvResult('found');
      } else {
        setCvResult('not-found');
      }
    } catch {
      setCvResult('error');
    } finally {
      setCvLoading(false);
    }
  };

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

            {step === 'name' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl mb-2">Vad heter du?</h2>
                  <p className="text-text-muted text-sm">Ditt förnamn räcker</p>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Förnamn"
                  autoFocus
                  className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-lg text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 min-h-[52px]"
                />
                <button
                  onClick={next}
                  disabled={!name.trim()}
                  className="w-full bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Nästa <ArrowRight size={18} />
                </button>
              </div>
            )}

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
                <div className="flex items-center bg-surface border border-border rounded-2xl overflow-hidden">
                  <span className="text-text-muted text-sm pl-4 shrink-0">linkedin.com/in/</span>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="ditt-namn"
                    autoFocus
                    className="flex-1 bg-transparent px-2 py-4 text-text text-base placeholder:text-text-muted focus:outline-none min-h-[52px]"
                  />
                </div>
                <p className="text-text-muted text-xs">Öppna LinkedIn-appen, gå till din profil och kopiera din URL</p>
                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px]"
                  >
                    {linkedin ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

            {step === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Globe size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">Portfolio</h2>
                    <p className="text-text-muted text-xs">Din hemsida med projekt och demos</p>
                  </div>
                </div>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="dinportfolio.se"
                  autoFocus
                  className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-base text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 min-h-[52px]"
                />
                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px]"
                  >
                    {portfolio ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

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
                <div className="flex items-center bg-surface border border-border rounded-2xl overflow-hidden">
                  <span className="text-text-muted text-sm pl-4 shrink-0">github.com/</span>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="ditt-username"
                    autoFocus
                    className="flex-1 bg-transparent px-2 py-4 text-text text-base placeholder:text-text-muted focus:outline-none min-h-[52px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px]"
                  >
                    {github ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

            {step === 'cv' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                    <FileText size={22} className="text-gold" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">CV</h2>
                    <p className="text-text-muted text-xs">Länk till ditt CV (PDF, Google Drive, etc.)</p>
                  </div>
                </div>

                {portfolio && (
                  <button
                    onClick={findCV}
                    disabled={cvLoading}
                    className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-sm font-medium text-text-muted hover:text-primary hover:border-primary/30 transition-all min-h-[48px] disabled:opacity-50"
                  >
                    {cvLoading ? 'Söker...' : 'Hitta CV från din portfolio'}
                  </button>
                )}
                {cvResult === 'found' && (
                  <p className="text-success text-xs flex items-center gap-1"><Check size={14} /> CV hittades automatiskt!</p>
                )}
                {cvResult === 'not-found' && (
                  <p className="text-text-muted text-xs">Hittade inget CV automatiskt. Klistra in länk nedan.</p>
                )}

                <input
                  type="url"
                  value={cvUrl}
                  onChange={(e) => setCvUrl(e.target.value)}
                  placeholder="Klistra in länk till CV"
                  className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-base text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 min-h-[52px]"
                />
                <div className="flex gap-3">
                  <button onClick={prev} className="p-4 rounded-2xl bg-surface border border-border min-w-[52px] min-h-[52px] flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl text-base hover:bg-primary-hover transition-all min-h-[52px]"
                  >
                    {cvUrl ? 'Nästa' : 'Hoppa över'}
                  </button>
                </div>
              </div>
            )}

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
                  <SummaryRow label="LinkedIn" value={linkedin ? `linkedin.com/in/${linkedin}` : '–'} />
                  <SummaryRow label="Portfolio" value={portfolio || '–'} />
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
