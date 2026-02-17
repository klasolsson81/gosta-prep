import { MessageCircleQuestion } from 'lucide-react';

const smartQuestions = [
  "Hur deployar ni idag och vad är er största flaskhals?",
  "Vilka buggar eller incidenter tar mest tid?",
  "Vad skiljer en junior som lyckas hos er från en som fastnar?",
  "Vilket system är mest känsligt – det ingen vill röra?",
  "Om jag bygger en liten POC på ert problem, vem vill ni att jag skickar den till?",
];

export default function SmartQuestions() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <MessageCircleQuestion size={14} className="text-gold" />
        <h2 className="font-medium text-[12px] text-text-muted uppercase tracking-[0.08em]">Smarta frågor</h2>
      </div>
      <div className="space-y-2">
        {smartQuestions.map((q, i) => (
          <div key={i} className="flex gap-3 items-start py-1.5">
            <span className="text-primary font-bold text-sm mt-0.5 font-mono">{i + 1}.</span>
            <p className="text-[14px] leading-relaxed text-text">{q}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
