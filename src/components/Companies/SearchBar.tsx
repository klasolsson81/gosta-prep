import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="sticky top-12 md:top-16 z-40 px-4 py-3 bg-bg/80 backdrop-blur-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Sök företag, tags, roller..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface/70 backdrop-blur-md border border-border rounded-2xl pl-11 pr-10 py-3 text-text text-[15px] placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-surface-light transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={16} className="text-text-muted" />
          </button>
        )}
      </div>
    </div>
  );
}
