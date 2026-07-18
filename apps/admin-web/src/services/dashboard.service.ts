import { mockApiCall } from '../api/client';

class DashboardService {
  async getAdminStats() {
    const [{ studentService }, { hostelService }, { roomService }, { bedService }, { feeService }, { complaintService }, { visitorService }, { attendanceService }, { leaveService }, { applicationService }] = await Promise.all([
      import('./student.service'), import('./hostel.service'), import('./room.service'), import('./bed.service'),
      import('./fee.service'), import('./complaint.service'), import('./visitor.service'), import('./attendance.service'),
      import('./leave.service'), import('./application.service'),
    ]);
    const [stuRes, hostelRes, roomRes, bedRes, feeRes, compRes, visitRes, attRes, leaveRes, appRes] = await Promise.all([
      studentService.getAll(), hostelService.getAll(), roomService.getAll(), bedService.getAll(),
      feeService.getAll(), complaintService.getAll(), visitorService.getAll(), attendanceService.getAll(),
      leaveService.getAll(), applicationService.getAll(),
    ]);
    const students = stuRes.data || [];
    const hostels = hostelRes.data || [];
    const rooms = roomRes.data || [];
    const beds = bedRes.data || [];
    const fees = feeRes.data || [];
    const complaints = compRes.data || [];
    const visitors = visitRes.data || [];
    const attendance = attRes.data || [];
    const leaves = leaveRes.data || [];
    const applications = appRes.data || [];

    const totalStudents = students.length;
    const totalHostels = hostels.length;
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    const totalCapacity = rooms.length > 0 ? Math.round(beds.length / rooms.length * 100) / 100 : 0;
    const totalOccupied = beds.filter(b => b.studentId).length;
    const occupancy = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
    const pendingApps = applications.filter(a => a.status === 'Pending' || a.status === 'Waitlisted').length;
    const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0);
    const pendingFees = fees.filter(f => f.status === 'Pending').reduce((a, f) => a + f.amount, 0);
    const activeComplaints = complaints.filter(c => c.status === 'Open' || c.status === 'Assigned' || c.status === 'In Progress').length;
    const today = new Date().toISOString().split('T')[0];
    const visitorsToday = visitors.filter(v => v.date === today).length;
    const todayAttendance = attendance.filter(a => a.date === today);
    const attendanceRate = todayAttendance.length > 0 ? Math.round((todayAttendance.filter(a => a.status === 'Present').length / todayAttendance.length) * 100) : 0;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

    return mockApiCall({
      totalStudents, totalHostels, totalRooms, occupiedRooms, availableRooms, occupancy,
      pendingApps, totalRevenue, pendingFees, activeComplaints, visitorsToday, attendanceRate, pendingLeaves,
    });
  }
}

export const dashboardService = new DashboardService();
