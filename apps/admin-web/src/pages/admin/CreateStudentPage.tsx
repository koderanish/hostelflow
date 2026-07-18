import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

export function CreateStudentPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<string>('Male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
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
    setSubmitting(true);
    const res = await studentService.createStudent({
      name, email, phone, gender: gender as 'Male' | 'Female' | 'Other',
      dob, bloodGroup: bloodGroup || undefined, address,
      enrollmentNo, department, course, year, semester,
      parentName, parentContact,
      emergencyContactName, emergencyContactPhone, emergencyContactRelation: emergencyContactRelation || undefined,
      status: status as 'Active' | 'Inactive' | 'Suspended' | 'Graduated',
      feeStatus: feeStatus as 'PAID' | 'PENDING' | 'OVERDUE',
      admissionDate,
    });
    if (res.success) {
      addToast('Student created successfully', 'success');
      navigate('/admin/students');
    } else {
      addToast('Failed to create student', 'error');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Create Student" description="Add a new student to the system" />
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
    </div>
  );
}
