import { ArrowLeft, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import type { ValidationStatus } from '../../hooks/useFieldValidation';

export function PrimaryButton({ onClick, disabled, children, fullWidth }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; fullWidth?: boolean }) {
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

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-4 rounded-[10px] bg-glass border border-glass-border hover:bg-glass-hover min-w-[52px] min-h-[52px] flex items-center justify-center transition-colors">
      <ArrowLeft size={18} className="text-text-muted" />
    </button>
  );
}

export function NextButton({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <PrimaryButton onClick={onClick} disabled={disabled}>
      {label || 'Nästa'} <ArrowRight size={18} />
    </PrimaryButton>
  );
}

export function ValidationBadge({ status, message }: { status: ValidationStatus; message: string }) {
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

export function validationBorderClass(status: ValidationStatus): string {
  if (status === 'valid') return 'border-success/50';
  if (status === 'invalid') return 'border-error/50';
  return 'border-border-subtle';
}

export function SummaryBadge({ icon, label, value, configured, mono, unconfiguredLabel }: { icon: React.ReactNode; label: string; value: string; configured: boolean; mono?: boolean; unconfiguredLabel?: string }) {
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
