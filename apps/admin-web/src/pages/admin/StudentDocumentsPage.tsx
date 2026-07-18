import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/document.service';
import { studentService } from '../../services/student.service';
import type { StudentDocument, Student } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useNotify } from '../../context/NotificationContext';
import { FileText, Search, Plus, Eye, ShieldCheck, ShieldX } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Verified: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Rejected: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function StudentDocumentsPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [docs, setDocs] = useState<StudentDocument[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      documentService.getAll(),
      studentService.getAll(),
    ]).then(([docRes, stuRes]) => {
      if (docRes.success && docRes.data) setDocs(docRes.data.filter((d: StudentDocument) => !d.isDeleted));
      if (stuRes.success && stuRes.data) setStudents(stuRes.data.filter((s: Student) => !s.isDeleted));
      setLoading(false);
    });
  }, []);

  const filtered = docs.filter(d => {
    if (selectedStudentId !== 'all' && d.studentId !== selectedStudentId) return false;
    if (search && !d.studentName.toLowerCase().includes(search.toLowerCase()) && !d.fileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStudentDocCount = (studentId: string) => docs.filter(d => d.studentId === studentId).length;
  const getStudentStatusSummary = (studentId: string) => {
    const s = docs.filter(d => d.studentId === studentId);
    const v = s.filter(d => d.status === 'Verified').length;
    const p = s.filter(d => d.status === 'Pending').length;
    const r = s.filter(d => d.status === 'Rejected').length;
    return `${v} Verified, ${p} Pending, ${r} Rejected`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Student Documents"
        description="View documents by student"
        actions={
          <button onClick={() => navigate('/admin/documents/upload')}
            className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> Upload</div>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student or file name..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="all">All Students</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({getStudentDocCount(s.id)} docs)</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <LoadingSkeleton rows={6} />
        </div>
      ) : selectedStudentId === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.filter(s => getStudentDocCount(s.id) > 0).map(s => (
            <button key={s.id} onClick={() => setSelectedStudentId(s.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-sm font-bold text-blue-700">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-[10px] text-slate-500">{s.enrollmentNo}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500"><strong>{getStudentDocCount(s.id)}</strong> documents</p>
              <p className="text-[10px] text-slate-400 mt-1">{getStudentStatusSummary(s.id)}</p>
            </button>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="No documents" description="This student has no documents uploaded yet." />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">File Name</th>
                  <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                  <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Upload Date</th>
                  <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-right py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => (
                  <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">{d.fileName}</td>
                    <td className="py-3.5 px-5"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{d.type}</span></td>
                    <td className="py-3.5 px-5 text-xs text-slate-500">{d.uploadedAt.split('T')[0]}</td>
                    <td className="py-3.5 px-5"><StatusBadge status={d.status} /></td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/admin/documents/${d.id}`)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {d.status === 'Pending' && (
                          <button onClick={() => navigate(`/admin/documents/${d.id}/verify`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
