import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search anything...' }: SearchBarProps) {
  return (
    <div className="flex-1 max-w-md hidden sm:block relative group">
      <div className="absolute inset-0 rounded-xl bg-brand-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors duration-200" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="relative w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all duration-200"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
        <kbd className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono">/</kbd>
      </div>
    </div>
  );
}
