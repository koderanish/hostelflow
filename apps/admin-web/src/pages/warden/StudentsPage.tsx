import { useState, useEffect } from 'react';
import { Sparkles, Users, Search, Eye, Phone, Mail, BookOpen, Building2, Wallet, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/student.service';
import { hostelService } from '../../services/hostel.service';
import { feeService } from '../../services/fee.service';
import { complaintService } from '../../services/complaint.service';
import { attendanceService } from '../../services/attendance.service';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Student, Hostel, Fee, Complaint } from '../../types';

export function WardenStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [hostel, setHostel] = useState<Hostel | undefined>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFees, setStudentFees] = useState<Fee[]>([]);
  const [studentComplaints, setStudentComplaints] = useState<Complaint[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    hostelService.getAll().then(hRes => {
      if (hRes.success && hRes.data) {
        setHostel(hRes.data[0]);
        return studentService.getByHostel(hRes.data[0].id);
      }
      return { success: true, data: [] };
    }).then((sRes: any) => {
      if (sRes.success && sRes.data) setStudents(sRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = async (s: Student) => {
    setSelectedStudent(s);
    setViewLoading(true);
    const [fRes, cRes, aRes] = await Promise.all([
      feeService.getByStudent(s.id),
      complaintService.getByStudent(s.id),
      attendanceService.getByStudent(s.id),
    ]);
    if (fRes.success && fRes.data) setStudentFees(fRes.data);
    if (cRes.success && cRes.data) setStudentComplaints(cRes.data);
    if (aRes.success && aRes.data) setStudentAttendance(aRes.data);
    setViewLoading(false);
  };

  const totalFees = studentFees.reduce((a, f) => a + f.amount, 0);
  const paidFees = studentFees.filter(f => f.status === 'Paid').reduce((a, f) => a + (f.paidAmount || f.amount), 0);
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Students
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Students</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{hostel?.name} · {students.length} students</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or enrollment..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Enrollment</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Course</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Room</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No students found</td></tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{s.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.enrollmentNo || '-'}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.course}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.roomNo || '-'}</td>
                    <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleView(s)} className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-700 font-medium">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={selectedStudent?.name || 'Student Details'} size="lg">
        {viewLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
        ) : selectedStudent ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white">{selectedStudent.name.charAt(0)}</div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedStudent.enrollmentNo} · {selectedStudent.course}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500"><Mail className="w-3 h-3" /> {user?.email}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500"><Phone className="w-3 h-3" /> {selectedStudent.phone}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-center">
                <ClipboardCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{attendanceRate}%</p>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Attendance</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-center">
                <Wallet className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">₹{paidFees.toLocaleString()}</p>
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">Paid / ₹{totalFees.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-center">
                <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{studentComplaints.length}</p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Complaints</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Personal Details</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Department', value: selectedStudent.department },
                  { label: 'Year', value: selectedStudent.year },
                  { label: 'Semester', value: selectedStudent.semester },
                  { label: 'Room', value: selectedStudent.roomNo || 'N/A' },
                  { label: 'DOB', value: selectedStudent.dob },
                  { label: 'Gender', value: selectedStudent.gender },
                  { label: 'Blood Group', value: selectedStudent.bloodGroup || 'N/A' },
                  { label: 'Address', value: selectedStudent.address },
                ].map(f => (
                  <div key={f.label} className="p-2.5 rounded-lg bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <p className="text-[10px] text-slate-400 uppercase">{f.label}</p>
                    <p className="text-xs font-medium text-slate-900 dark:text-white mt-0.5">{f.value || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
