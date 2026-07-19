import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, CheckCircle, Copy, Printer } from 'lucide-react';

export function CreateStudentPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ name: string; loginId: string; password: string } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<string>('Male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [status, setStatus] = useState<string>('Active');
  const [feeStatus, setFeeStatus] = useState<string>('PENDING');
  const [admissionDate, setAdmissionDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !enrollmentNo || !department || !course || !year || !semester || !parentName || !parentContact || !emergencyContactName || !emergencyContactPhone || !admissionDate) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    if (dob) {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        addToast('Date of birth is invalid', 'error');
        return;
      }
      if (dobDate > new Date()) {
        addToast('Date of birth cannot be in the future', 'error');
        return;
      }
      const age = Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 15 || age > 100) {
        addToast('Date of birth must correspond to an age between 15 and 100 years', 'error');
        return;
      }
    }
    setSubmitting(true);
    const res = await api.post<any>('/students', {
      name, email, phone, gender,
      dob, bloodGroup: bloodGroup || undefined, address,
      registrationNo: registrationNo || undefined, enrollmentNo, department, course, year, semester,
      parentName, parentContact,
      emergencyContactName, emergencyContactPhone, emergencyContactRelation: emergencyContactRelation || undefined,
      status, feeStatus, admissionDate,
    });
    if (res.success) {
      setCredentials({
        name,
        loginId: email,
        password: res.data?.generatedPassword || '',
      });
    } else {
      addToast(res.error || 'Failed to create student', 'error');
    }
    setSubmitting(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied`, 'success');
  };

  const handleCopyAll = () => {
    const text = `Login ID: ${email}\nPassword: ${credentials?.password || ''}`;
    navigator.clipboard.writeText(text);
    addToast('Credentials copied', 'success');
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Login Credentials - ${name}</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f1f5f9; }
        .card { background: white; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        h1 { font-size: 20px; margin: 0 0 4px; color: #0f172a; }
        .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 2px; font-family: monospace; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; margin-bottom: 16px; }
      </style></head><body>
      <div class="card">
        <div class="badge">HostelFlow</div>
        <h1>${name}</h1>
        <p class="sub">Student login credentials</p>
        <div class="field"><div class="label">Login ID (Email)</div><div class="value">${email}</div></div>
        <div class="field"><div class="label">Password</div><div class="value">${credentials?.password || ''}</div></div>
        <div class="footer">Please change your password after first login.</div>
      </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Create Student" description="Add a new student to the system" />

      {credentials ? (
        <div ref={printRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Student Created</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Login credentials generated</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Student</label>
              <p className="text-base font-medium text-slate-900 dark:text-white">{credentials.name}</p>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Login ID (Email)</label>
                <p className="text-sm font-mono text-slate-900 dark:text-white mt-0.5">{credentials.loginId}</p>
              </div>
              <button onClick={() => handleCopy(credentials.loginId, 'Login ID')}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Copy className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                <p className="text-sm font-mono text-slate-900 dark:text-white mt-0.5">{credentials.password}</p>
              </div>
              <button onClick={() => handleCopy(credentials.password, 'Password')}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Copy className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print
            </button>
            <div className="flex gap-3">
              <button onClick={() => navigate('/admin/students')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Students List
              </button>
              <button onClick={() => navigate('/admin/students/create')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 flex items-center gap-2">
                Add Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Student's full name" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@example.com" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Phone *</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Blood Group</label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <label className={labelClass}>Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Permanent address" className={inputClass} />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className={labelClass}>Registration No</label>
                  <input type="text" value={registrationNo} onChange={e => setRegistrationNo(e.target.value)} placeholder="e.g. REG2024001" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Enrollment No *</label>
                  <input type="text" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)} placeholder="e.g. 2024CS001" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Department *</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Computer Science" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Course *</label>
                  <input type="text" value={course} onChange={e => setCourse(e.target.value)} placeholder="B.Tech Computer Science" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Year *</label>
                  <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="1st Year" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Semester *</label>
                  <input type="text" value={semester} onChange={e => setSemester(e.target.value)} placeholder="Sem 1" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Admission Date *</label>
                  <input type="date" value={admissionDate} onChange={e => setAdmissionDate(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Contact & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className={labelClass}>Parent Name *</label>
                  <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Parent's full name" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Parent Contact *</label>
                  <input type="text" value={parentContact} onChange={e => setParentContact(e.target.value)} placeholder="Parent's phone number" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Emergency Contact Name *</label>
                  <input type="text" value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)} placeholder="Emergency contact's name" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Emergency Contact Phone *</label>
                  <input type="text" value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)} placeholder="Emergency contact number" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Emergency Contact Relation</label>
                  <input type="text" value={emergencyContactRelation} onChange={e => setEmergencyContactRelation(e.target.value)} placeholder="e.g. Father, Mother, Guardian" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Fee Status</label>
                  <select value={feeStatus} onChange={e => setFeeStatus(e.target.value)} className={inputClass}>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => navigate('/admin/students')}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
