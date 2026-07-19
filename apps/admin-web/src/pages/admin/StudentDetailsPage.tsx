import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { studentEventService } from '../../services/student-event.service';
import { hostelService } from '../../services/hostel.service';
import type { Student, StudentEvent } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Clock, History, User, Home, CreditCard, FileText, KeyRound, CheckCircle, Copy, Printer, X } from 'lucide-react';
import { formatDate, formatDateTime, calculateAge } from '../../utils';

type Tab = 'overview' | 'hostel' | 'fee' | 'documents' | 'history';

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Created: 'Student Created',
    Updated: 'Details Updated',
    StatusChanged: 'Status Changed',
    Allocated: 'Room Allocated',
    Vacated: 'Room Vacated',
    DocumentVerified: 'Document Verified',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Created' || type === 'DocumentVerified') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'Vacated') return 'border-slate-400 bg-slate-50 dark:bg-slate-800/30';
  if (type === 'StatusChanged') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  if (type === 'Allocated') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

export function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [student, setStudent] = useState<Student | null>(null);
  const [hostelName, setHostelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{ loginId: string; name: string; generatedPassword: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<StudentEvent[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      studentService.getById(id),
      hostelService.getAll(),
      studentEventService.getByStudent(id),
    ]).then(([stuRes, hostelRes, evtRes]) => {
      if (stuRes.success && stuRes.data && !stuRes.data.isDeleted) {
        setStudent(stuRes.data);
        const hName = hostelRes.data?.find(h => h.id === stuRes.data!.hostelId)?.name || '';
        setHostelName(hName);
        setEvents(evtRes.data || []);
      } else {
        navigate('/admin/students');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!student) return;
    setDeleting(true);
    const res = await studentService.softDelete(student.id);
    if (res.success) {
      addToast('Student deleted successfully', 'success');
      navigate('/admin/students');
    } else {
      addToast(res.error || 'Failed to delete student', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const handleResetPassword = async () => {
    if (!student) return;
    setResetting(true);
    const res = await studentService.resetPassword(student.id);
    if (res.success && res.data) {
      setResetResult(res.data);
      addToast('Password reset successfully', 'success');
    } else {
      addToast(res.error || 'Failed to reset password', 'error');
    }
    setResetting(false);
  };

  const handleCopyResetPassword = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied`, 'success');
  };

  const handlePrintReset = () => {
    const w = window.open('', '_blank');
    if (!w || !resetResult) return;
    w.document.write(`
      <html><head><title>New Login Credentials - ${resetResult.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f1f5f9; }
        .card { background: white; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        h1 { font-size: 20px; margin: 0 0 4px; color: #0f172a; }
        .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 2px; font-family: monospace; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
        .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; margin-bottom: 16px; }
      </style></head><body>
      <div class="card">
        <div class="badge">Password Reset</div>
        <h1>${resetResult.name}</h1>
        <p class="sub">New login credentials</p>
        <div class="field"><div class="label">Login ID (Email)</div><div class="value">${resetResult.loginId}</div></div>
        <div class="field"><div class="label">New Password</div><div class="value">${resetResult.generatedPassword}</div></div>
        <div class="footer">Student must change password after first login.</div>
      </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!student) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'hostel', label: 'Hostel', icon: <Home className="w-3.5 h-3.5" /> },
    { key: 'fee', label: 'Fee', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { key: 'documents', label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'history', label: `History (${merged.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const infoRow = (label: string, value: string | undefined) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value || '-'}</span>
    </div>
  );

  const badgeClass = (status: string) => {
    const map: Record<string, string> = {
      Active: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
      Inactive: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-400',
      Suspended: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
      Graduated: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
    };
    return map[status] || 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-400';
  };

  const feeBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
      PENDING: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
      OVERDUE: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
    };
    return map[status] || 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={student.name}
        description="Student details and management"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/students"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Link to={`/admin/students/${student.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
            <button onClick={handleResetPassword} disabled={resetting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/30 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {resetting ? 'Resetting...' : 'Reset Password'}
            </button>
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" /> Personal Information
            </h3>
            <div className="space-y-0">
              {infoRow('Full Name', student.name)}
              {infoRow('Email', student.email)}
              {infoRow('Phone', student.phone)}
              {infoRow('Gender', student.gender)}
              {infoRow('Date of Birth', student.dob ? formatDate(student.dob) : undefined)}
              {infoRow('Age', student.dob ? String(calculateAge(student.dob)) : undefined)}
              {infoRow('Blood Group', student.bloodGroup)}
              {infoRow('Address', student.address)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" /> Academic Information
            </h3>
            <div className="space-y-0">
              {infoRow('Enrollment No', student.enrollmentNo)}
              {infoRow('Registration No', student.registrationNo)}
              {infoRow('Department', student.department)}
              {infoRow('Course', student.course)}
              {infoRow('Year', student.year)}
              {infoRow('Semester', student.semester)}
              {infoRow('Admission Date', student.admissionDate ? formatDate(student.admissionDate) : undefined)}
              {infoRow('Status', undefined)}
            </div>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badgeClass(student.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : student.status === 'Inactive' ? 'bg-slate-400' : student.status === 'Suspended' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                {student.status}
              </span>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Parent</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{student.parentName}</p>
                <p className="text-xs text-slate-500">{student.parentContact}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Emergency Contact</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{student.emergencyContactName}</p>
                <p className="text-xs text-slate-500">{student.emergencyContactPhone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Relation</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{student.emergencyContactRelation || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hostel' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Home className="w-4 h-4 text-brand-500" /> Hostel Allocation
          </h3>
          {student.hostelId ? (
            <div className="space-y-0">
              {infoRow('Hostel', hostelName || student.hostelId)}
              {infoRow('Room No', student.roomNo || student.roomId || '-')}
              {infoRow('Room ID', student.roomId || '-')}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Home className="w-10 h-10 mb-3" />
              <p className="text-sm">Student is not allocated to any hostel room</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'fee' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-500" /> Fee Information
          </h3>
          <div className="space-y-0">
            {infoRow('Fee Status', undefined)}
            {infoRow('Admission Date', student.admissionDate ? formatDate(student.admissionDate) : undefined)}
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${feeBadgeClass(student.feeStatus)}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${student.feeStatus === 'PAID' ? 'bg-emerald-500' : student.feeStatus === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              {student.feeStatus}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" /> Documents
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FileText className="w-10 h-10 mb-3" />
            <p className="text-sm">Document management coming soon</p>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          {merged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <History className="w-10 h-10 mb-3" />
              <p className="text-sm">No events recorded yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {merged.map((evt, i) => (
                <div key={evt.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${eventColor(evt.eventType)}`} />
                    {i < merged.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {eventLabel(evt.eventType)}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(evt.timestamp)}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                      {evt.previousStatus && evt.newStatus && (
                        <p>{evt.previousStatus} → {evt.newStatus}</p>
                      )}
                      {evt.details && <p>{evt.details}</p>}
                      {evt.performedBy && <p className="text-slate-400">by {evt.performedBy}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete "${student.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />

      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Password Reset</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">New login credentials</p>
                </div>
              </div>
              <button onClick={() => setResetResult(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Student</label>
                <p className="text-base font-medium text-slate-900 dark:text-white">{resetResult.name}</p>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Login ID (Email)</label>
                  <p className="text-sm font-mono text-slate-900 dark:text-white mt-0.5 break-all">{resetResult.loginId}</p>
                </div>
                <button onClick={() => handleCopyResetPassword(resetResult.loginId, 'Login ID')}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">New Password</label>
                  <p className="text-sm font-mono text-slate-900 dark:text-white mt-0.5">{resetResult.generatedPassword}</p>
                </div>
                <button onClick={() => handleCopyResetPassword(resetResult.generatedPassword, 'Password')}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={handlePrintReset}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={() => setResetResult(null)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
