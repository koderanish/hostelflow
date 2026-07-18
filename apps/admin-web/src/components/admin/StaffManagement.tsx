import { useState } from 'react';
import { INITIAL_STAFF } from '../../data';
import { UserCog, Search, Plus, Mail, Phone, Sparkles } from 'lucide-react';

export default function StaffManagement() {
  const [search, setSearch] = useState('');

  const filtered = INITIAL_STAFF.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Team
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Staff Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage hostel staff</p>
        </div>
        <button className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> Add Staff</span>
        </button>
      </div>

      <div className="relative max-w-sm group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s, idx) => (
          <div key={s.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-xl" />
            <div className="relative flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">
                {s.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.role}</p>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><Mail className="w-3 h-3 shrink-0" /> {s.email}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><Phone className="w-3 h-3 shrink-0" /> {s.phone}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">{s.department}</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Joined: {s.joinDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
