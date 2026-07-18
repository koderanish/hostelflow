import { useState, useEffect } from 'react';
import { Sparkles, User, Mail, Phone, Building2, BookOpen, Heart, Shield, Edit3, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { documentService } from '../../services/document.service';
import type { Student, StudentDocument } from '../../types';

export function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | undefined>();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(sRes => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        return documentService.getByStudent(sRes.data.id);
      }
      return Promise.resolve({ success: true, data: [] });
    }).then((dRes: any) => {
      if (dRes.success && dRes.data) setDocuments(dRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-48 animate-pulse" />
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Profile
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-medium">
          <Edit3 className="w-3.5 h-3.5" /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profile?.name || user?.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.enrollmentNo}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{profile?.course}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <div className={`w-2 h-2 rounded-full ${profile?.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {profile?.status || 'Active'}
              </div>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-600" /> Documents
              </h3>
              <div className="space-y-2">
                {documents.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{d.fileName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{d.type}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      d.status === 'Verified' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                      d.status === 'Rejected' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                      'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
                    }`}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Department', value: profile?.department, icon: BookOpen },
                { label: 'Course', value: profile?.course, icon: BookOpen },
                { label: 'Year', value: profile?.year, icon: BookOpen },
                { label: 'Semester', value: profile?.semester, icon: BookOpen },
                { label: 'Hostel', value: profile?.hostelId ? 'Allocated' : 'Not allocated', icon: Building2 },
                { label: 'Room', value: profile?.roomNo || 'N/A', icon: Building2 },
                { label: 'Email', value: user?.email, icon: Mail },
                { label: 'Phone', value: profile?.phone, icon: Phone },
                { label: 'Date of Birth', value: profile?.dob, icon: User },
                { label: 'Blood Group', value: profile?.bloodGroup || 'N/A', icon: Heart },
                { label: 'Gender', value: profile?.gender, icon: User },
                { label: 'Address', value: profile?.address, icon: Building2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-brand-500/10 to-accent-500/10">
                    <Icon className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{value || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Parent Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Parent Name', value: profile?.parentName, icon: User },
                  { label: 'Parent Contact', value: profile?.parentContact, icon: Phone },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <Icon className="w-4 h-4 text-brand-600" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{value || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Emergency Contact</h3>
              <div className="space-y-3">
                {[
                  { label: 'Contact Name', value: profile?.emergencyContactName, icon: Shield },
                  { label: 'Contact Phone', value: profile?.emergencyContactPhone, icon: Phone },
                  { label: 'Relation', value: profile?.emergencyContactRelation || 'N/A', icon: User },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <Icon className="w-4 h-4 text-brand-600" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{value || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
