import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="sticky top-14 z-40 px-4 py-3" style={{ background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px)' }}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
        <input
          type="text"
          placeholder="Sök företag, tags, roller..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface border border-border-subtle rounded-[10px] pl-10 pr-10 py-3 text-text text-[14px] placeholder:text-text-dim focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all h-[44px]"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-glass-hover transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X size={14} className="text-text-muted" />
          </button>
        )}
      </div>
      {resultCount !== undefined && (
        <p className="text-text-dim text-[11px] font-medium mt-1.5 px-1">{resultCount} företag</p>
      )}
    </div>
  );
}
