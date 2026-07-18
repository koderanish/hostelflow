import { useState } from 'react';
import { INITIAL_NOTICES } from '../../data';
import { Megaphone, Plus, Search, Sparkles } from 'lucide-react';

export default function NoticesView() {
  const [search, setSearch] = useState('');

  const filtered = INITIAL_NOTICES.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Announcements
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notices & Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Post and manage announcements</p>
        </div>
        <button className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> Add Notice</span>
        </button>
      </div>

      <div className="relative max-w-sm group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        <input type="text" placeholder="Search notices..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((n, idx) => (
          <div key={n.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className={`absolute -top-8 -right-8 w-24 h-24 ${n.category === 'Event' ? 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10' : 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10'} rounded-full blur-xl`} />
            <div className="relative flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${n.category === 'Event' ? 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10' : 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10'}`}>
                <Megaphone className={`w-5 h-5 ${n.category === 'Event' ? 'text-indigo-600' : 'text-indigo-600'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${n.category === 'Event' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'}`}>{n.category}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">{n.content}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{n.date} · Posted by {n.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
