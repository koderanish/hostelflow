import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { roleTheme } from '../../theme/roleTheme';
import { studentService } from '../../services/student.service';
import { hostelService } from '../../services/hostel.service';
import { complaintService } from '../../services/complaint.service';
import { leaveService } from '../../services/leave.service';
import { attendanceService } from '../../services/attendance.service';
import type { Student, Hostel, Complaint, LeaveRequest, Attendance } from '../../types';
import { Users, Building2, AlertTriangle, Calendar, ClipboardCheck, Sparkles } from "lucide-react";

export default function WardenDashboard() {
  const { user } = useAuth();
  const theme = roleTheme[user?.role || 'warden'];
  const [students, setStudents] = useState<Student[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getAll(),
      hostelService.getAll(),
      complaintService.getAll(),
      leaveService.getAll(),
      attendanceService.getAll(),
    ]).then(([sRes, hRes, cRes, lRes, aRes]) => {
      if (sRes.success && sRes.data) setStudents(sRes.data);
      if (hRes.success && hRes.data) setHostels(hRes.data);
      if (cRes.success && cRes.data) setComplaints(cRes.data);
      if (lRes.success && lRes.data) setLeaves(lRes.data);
      if (aRes.success && aRes.data) setAttendance(aRes.data);
      setLoading(false);
    });
  }, []);

  const totalStudents = students.length;
  const totalHostels = hostels.length;
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
  const openComplaints = complaints.filter(c => c.status === "Open" || c.status === "Assigned").length;
  const todayPresent = attendance.filter(a => a.status === "Present").length;
  const todayTotal = attendance.length;
  const attendanceRate = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

  const statCards = [
    { label: "Total Students", value: totalStudents, icon: Users, trend: "+2 this week", color: "from-blue-500 to-cyan-500", iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500' },
    { label: "Hostels", value: totalHostels, icon: Building2, trend: "under supervision", color: "from-emerald-500 to-teal-500", iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-500' },
    { label: "Pending Leaves", value: pendingLeaves, icon: Calendar, trend: "review needed", color: "from-violet-500 to-purple-600", iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-600/20', iconColor: 'text-violet-500' },
    { label: "Open Complaints", value: openComplaints, icon: AlertTriangle, trend: "needs action", color: "from-red-500 to-rose-600", iconBg: 'bg-gradient-to-br from-red-500/20 to-rose-600/20', iconColor: 'text-red-500' },
  ];

  const pendingLeaveItems = leaves.filter(l => l.status === "Pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.hero} p-6 md:p-8`}>
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-violet-500/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className={`flex items-center gap-2 ${theme.lightText} text-xs font-medium uppercase tracking-widest mb-2`}>
            <Sparkles className="w-3.5 h-3.5" />
            Warden Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Hostel Operations</h1>
          <p className="text-sm text-white/60 mt-1">Monitor students, attendance, and requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden" style={{ animationDelay: `${idx * 80}ms` }}>
              <div className={`absolute -top-8 -right-8 w-20 h-20 ${s.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
              <div className="relative flex items-start justify-between">
                <div className={`p-3 rounded-xl ${s.iconBg}`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{s.trend}</span>
              </div>
              <p className="relative text-2xl font-bold text-slate-900 dark:text-white mt-4">{s.value}</p>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full" />
          <div className="relative">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Pending Leave Requests</h3>
            {pendingLeaveItems.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No pending requests</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingLeaveItems.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-xs font-bold text-amber-700">{l.studentName.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{l.studentName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{l.fromDate} to {l.toDate} - {l.reason}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 font-medium">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full" />
          <div className="relative">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Today's Attendance</h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${attendanceRate}, 100`}
                    className="text-emerald-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{attendanceRate}%</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">present</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Present', value: todayPresent, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' },
                  { label: 'Absent', value: attendance.filter(a => a.status === "Absent").length, color: 'text-red-600', bg: 'bg-gradient-to-br from-red-500/20 to-rose-500/20' },
                  { label: 'Late', value: attendance.filter(a => a.status === "Late").length, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' },
                ].map(s => (
                  <div key={s.label} className={`text-center p-2 rounded-xl ${s.bg}`}>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.label}</p>
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
