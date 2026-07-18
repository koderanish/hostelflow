import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { messService } from '../../services/mess.service';
import { studentService } from '../../services/student.service';
import type { MealRequest, Student } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { ClipboardList, Search, Loader2, Check, X, Plus, Trash2, Eye } from 'lucide-react';

const requestSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  date: z.string().min(1, 'Date is required'),
  mealType: z.enum(['Breakfast', 'Lunch', 'Snacks', 'Dinner']),
  items: z.string().min(1, 'Items are required'),
  reason: z.string().min(1, 'Reason is required'),
  dietaryPreference: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Approved: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
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

export function MealRequestsPage() {
  const { addToast } = useNotify();
  const [requests, setRequests] = useState<MealRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MealRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<MealRequest | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectError, setRejectError] = useState('');

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    const [reqRes, stuRes] = await Promise.all([
      messService.getRequests(filters),
      studentService.getAll(),
    ]);
    if (reqRes.success && reqRes.data) setRequests((reqRes.data as MealRequest[]).filter(r => !r.isDeleted));
    if (stuRes.success && stuRes.data) setStudents(stuRes.data.filter((s: Student) => !s.isDeleted));
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setValue('studentId', student.id);
    setShowStudentPicker(false);
    setStudentSearch('');
  };

  const onSubmit = async (data: RequestFormData) => {
    if (!selectedStudent) { addToast('Please select a student', 'error'); return; }
    setSubmitting(true);
    const res = await messService.addRequest({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      date: data.date,
      mealType: data.mealType,
      items: data.items,
      reason: data.reason,
      dietaryPreference: data.dietaryPreference || undefined,
    });
    if (res.success) {
      addToast('Request submitted successfully', 'success');
      reset(); setSelectedStudent(null); setShowForm(false);
      fetchRequests();
    } else {
      addToast((res as any).error || 'Failed to create request', 'error');
    }
    setSubmitting(false);
  };

  const handleApprove = async (req: MealRequest) => {
    const res = await messService.approveRequest(req.id);
    if (res.success) { addToast('Request approved', 'success'); fetchRequests(); }
    else { addToast((res as any).error || 'Failed to approve', 'error'); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectRemarks.trim()) { setRejectError('Remarks required for rejection'); return; }
    setSubmitting(true);
    const res = await messService.rejectRequest(rejectTarget.id, rejectRemarks);
    if (res.success) { addToast('Request rejected', 'success'); setRejectTarget(null); setRejectRemarks(''); fetchRequests(); }
    else { addToast((res as any).error || 'Failed to reject', 'error'); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await messService.deleteRequest(deleteTarget.id);
    if (res.success) { addToast('Request deleted', 'success'); setDeleteTarget(null); fetchRequests(); }
    else { addToast(res.error || 'Failed to delete', 'error'); }
    setDeleting(false);
  };

  const filtered = requests.filter(r =>
    r.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Meal Requests"
        description="Manage special meal requests"
        actions={
          <button onClick={() => { setShowForm(!showForm); if (!showForm) { reset(); setSelectedStudent(null); } }}
            className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> New Request</div>
          </button>
        }
      />

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">New Meal Request</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Student *</label>
              {selectedStudent ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.name}</p>
                      <p className="text-[10px] text-slate-500">{selectedStudent.enrollmentNo}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedStudent(null); setValue('studentId', ''); }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium">Change</button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setShowStudentPicker(true); }}
                    onFocus={() => setShowStudentPicker(true)} placeholder="Search for a student..." className={inputClass + " pl-10"} />
                  {showStudentPicker && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredStudents.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400">No students found</p>
                      ) : filteredStudents.map(s => (
                        <button key={s.id} type="button" onClick={() => selectStudent(s)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{s.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                            <p className="text-[10px] text-slate-500">{s.enrollmentNo}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {errors.studentId && <p className={errorClass}>{errors.studentId.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Date *</label>
                <input type="date" {...register('date')} className={inputClass} />
                {errors.date && <p className={errorClass}>{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Meal Type *</label>
                <select {...register('mealType')} className={inputClass}>
                  <option value="">Select</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
                {errors.mealType && <p className={errorClass}>{errors.mealType.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Dietary Preference</label>
                <input type="text" {...register('dietaryPreference')} placeholder="e.g. Jain, Vegan" className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Requested Items *</label>
              <input type="text" {...register('items')} placeholder="e.g. Jain Thali - No onion/garlic" className={inputClass} />
              {errors.items && <p className={errorClass}>{errors.items.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Reason *</label>
              <textarea {...register('reason')} rows={2} placeholder="e.g. Religious fasting, medical diet" className={inputClass} />
              {errors.reason && <p className={errorClass}>{errors.reason.message}</p>}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <LoadingSkeleton rows={6} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="No requests found"
          description={search ? 'Try adjusting your search' : 'No meal requests yet'} />
      ) : (
        <div className="space-y-3">
          {filtered.map((req, idx) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center text-sm font-bold text-indigo-700">
                    {req.studentName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{req.studentName}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{req.mealType} · {req.date}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2"><strong>Items:</strong> {req.items}</p>
                    <p className="text-xs text-slate-500 mt-1">{req.reason}</p>
                    {req.dietaryPreference && (
                      <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400">
                        {req.dietaryPreference}
                      </span>
                    )}
                    {req.remarks && (
                      <p className="text-xs text-slate-500 mt-2 italic">Remarks: {req.remarks}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {req.status === 'Pending' && (
                    <>
                      <button onClick={() => handleApprove(req)}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setRejectTarget(req)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setDeleteTarget(req)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Request"
        message="Are you sure you want to delete this request?"
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />

      <ConfirmDialog
        isOpen={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectRemarks(''); setRejectError(''); }}
        onConfirm={handleReject}
        title="Reject Request"
        message={
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Reject the meal request from <strong>{rejectTarget?.studentName}</strong>?</p>
            <textarea value={rejectRemarks} onChange={e => { setRejectRemarks(e.target.value); setRejectError(''); }}
              rows={3} placeholder="Reason for rejection (required)..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
            {rejectError && <p className="text-xs text-rose-500">{rejectError}</p>}
          </div>
        }
        confirmLabel="Reject"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
