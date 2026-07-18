import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleTheme } from '../../theme/roleTheme';
import { studentService } from '../../services/student.service';
import { feeService } from '../../services/fee.service';
import { complaintService } from '../../services/complaint.service';
import { attendanceService } from '../../services/attendance.service';
import { leaveService } from '../../services/leave.service';
import { applicationService } from '../../services/application.service';
import { allocationService } from '../../services/allocation.service';
import { notificationService } from '../../services/notification.service';
import type { Student, Fee, Complaint, Attendance, LeaveRequest, HostelApplication, RoomAllocation, Notification } from '../../types';
import { Wallet, AlertTriangle, CalendarCheck, Building2, Sparkles, GraduationCap, Bell, DoorOpen, FileText, ArrowRight, Calendar, ClipboardCheck } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const theme = roleTheme[user?.role || 'student'];
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Student | undefined>();
  const [myFees, setMyFees] = useState<Fee[]>([]);
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [applications, setApplications] = useState<HostelApplication[]>([]);
  const [allocations, setAllocations] = useState<RoomAllocation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(sRes => {
      if (sRes.success && sRes.data) {
        const p = sRes.data;
        setProfile(p);
        return Promise.all([
          feeService.getByStudent(p.id),
          complaintService.getByStudent(p.id),
          attendanceService.getByStudent(p.id),
          leaveService.getByStudent(p.id),
          applicationService.getByStudent(p.id),
          allocationService.getByStudent(p.id),
          notificationService.getAll(user.id),
        ]);
      }
      return Promise.all(Array(7).fill(Promise.resolve({ success: true, data: [] })));
    }).then(([fRes, cRes, aRes, lRes, appRes, alRes, nRes]: any[]) => {
      if (fRes?.success && fRes?.data) setMyFees(fRes.data);
      if (cRes?.success && cRes?.data) setMyComplaints(cRes.data);
      if (aRes?.success && aRes?.data) setAttendance(aRes.data);
      if (lRes?.success && lRes?.data) setLeaves(lRes.data);
      if (appRes?.success && appRes?.data) setApplications(appRes.data);
      if (alRes?.success && alRes?.data) setAllocations(alRes.data);
      if (nRes?.success && nRes?.data) setNotifications(nRes.data);
      setLoading(false);
    });
  }, [user]);

  const paidFees = myFees.filter(f => f.status === 'Paid').length;
  const pendingFees = myFees.filter(f => f.status === 'Pending' || f.status === 'Overdue').length;
  const present = attendance.filter(a => a.status === 'Present').length;
  const attendanceRate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
  const activeComplaints = myComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const activeApp = applications.find(a => a.status !== 'Cancelled' && a.status !== 'Rejected');
  const activeAlloc = allocations.find(a => a.status === 'Active');
  const recentNotifications = notifications.slice(0, 4);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const quickActions = [
    { label: 'Apply Leave', icon: Calendar, path: '/student/leave', iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-600/20', iconColor: 'text-violet-500' },
    { label: 'Raise Complaint', icon: AlertTriangle, path: '/student/complaints', iconBg: 'bg-gradient-to-br from-red-500/20 to-rose-600/20', iconColor: 'text-red-500' },
    { label: 'View Fees', icon: Wallet, path: '/student/payments', iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20', iconColor: 'text-emerald-500' },
    { label: 'My Attendance', icon: ClipboardCheck, path: '/student/attendance', iconBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20', iconColor: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.hero} p-6 md:p-8`}>
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-teal-600/20 to-emerald-500/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className={`flex items-center gap-2 ${theme.lightText} text-xs font-medium uppercase tracking-widest mb-2`}>
            <Sparkles className="w-3.5 h-3.5" />
            Student Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-white/60 mt-1">Here's your hostel overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: ClipboardCheck, sub: `${present}/${attendance.length} days`, color: 'bg-gradient-to-br from-purple-500 to-indigo-600', iconBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20', iconColor: 'text-purple-500' },
          { label: 'Room', value: activeAlloc?.roomNo || 'N/A', icon: DoorOpen, sub: activeAlloc?.hostelName || 'Not allocated', color: 'from-indigo-500 to-blue-600', iconBg: 'bg-gradient-to-br from-indigo-500/20 to-blue-600/20', iconColor: 'text-indigo-500' },
          { label: 'Fees', value: pendingFees > 0 ? `${pendingFees} Pending` : 'All Clear', icon: Wallet, sub: `${paidFees}/${myFees.length} paid`, color: pendingFees > 0 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500', iconBg: pendingFees > 0 ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20', iconColor: pendingFees > 0 ? 'text-amber-500' : 'text-emerald-500' },
          { label: 'Application', value: activeApp ? activeApp.status : 'N/A', icon: FileText, sub: activeApp ? `Applied ${activeApp.appliedDate}` : 'Not applied', color: 'from-sky-500 to-blue-600', iconBg: 'bg-gradient-to-br from-sky-500/20 to-blue-600/20', iconColor: 'text-sky-500' },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden" style={{ animationDelay: `${idx * 80}ms` }}>
              <div className={`absolute -top-8 -right-8 w-20 h-20 ${s.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
              <div className="relative flex items-start justify-between">
                <div className={`p-3 rounded-xl ${s.iconBg}`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
              </div>
              <p className="relative text-2xl font-bold text-slate-900 dark:text-white mt-4">{s.value}</p>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}<span className="text-slate-400 dark:text-slate-500 ml-1">· {s.sub}</span></p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((a, idx) => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:border-slate-300 dark:hover:border-slate-700 transition-all" style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className={`inline-flex p-2.5 rounded-xl ${a.iconBg} mb-2`}>
                    <Icon className={`w-5 h-5 ${a.iconColor}`} />
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.label}</p>
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Complaints</h3>
                {activeComplaints > 0 && <span className="px-1.5 py-0.5 bg-gradient-to-br from-rose-500/10 to-pink-500/10 text-rose-700 dark:text-rose-400 rounded text-[10px] font-medium">{activeComplaints} active</span>}
              </div>
            </div>
            <div className="p-5">
              {myComplaints.length === 0 ? (
                <div className="text-center py-6">
                  <AlertTriangle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">No complaints raised yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myComplaints.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{c.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.category} · {c.roomNo}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'Resolved' || c.status === 'Closed' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                        c.status === 'In Progress' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400' :
                        c.status === 'Assigned' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400' :
                        'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400'
                      }`}>{c.status}</span>
                    </div>
                  ))}
                  {myComplaints.length > 3 && (
                    <button onClick={() => navigate('/student/complaints')} className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium mt-2">
                      View all <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
              </div>
            </div>
            <div className="p-5">
              {recentNotifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.map(n => (
                    <div key={n.id} className={`p-3 rounded-xl ${n.read ? 'bg-gradient-to-br from-slate-500/10 to-slate-400/10' : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Leave</h3>
                {pendingLeaves > 0 && <span className="px-1.5 py-0.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-400 rounded text-[10px] font-medium">{pendingLeaves} pending</span>}
              </div>
            </div>
            <div className="p-5">
              {leaves.filter(l => l.status === 'Approved' || l.status === 'Pending').length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">No leave requests</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaves.filter(l => l.status === 'Approved' || l.status === 'Pending').slice(0, 3).map(l => (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">{l.leaveType} Leave</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{l.fromDate} to {l.toDate}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${l.status === 'Approved' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Fees</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fee Type</th>
                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</th>
                <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {myFees.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-sm text-slate-400">No fee records found</td></tr>
              ) : (
                myFees.map(f => (
                  <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-6 text-slate-900 dark:text-white font-medium">{f.feeType}</td>
                    <td className="py-3.5 px-6 text-slate-900 dark:text-white font-semibold">₹{f.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">{f.dueDate}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        f.status === 'Paid' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                        f.status === 'Pending' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400' :
                        f.status === 'Overdue' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                        'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          f.status === 'Paid' ? 'bg-emerald-500' :
                          f.status === 'Pending' ? 'bg-amber-500' :
                          f.status === 'Overdue' ? 'bg-rose-500' : 'bg-blue-500'
                        }`} />
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
