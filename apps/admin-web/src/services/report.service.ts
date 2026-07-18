import { mockApiCall } from '../api/client';

class ReportService {
  async getAttendanceReport(from: string, to: string) {
    const { attendanceService } = await import('./attendance.service');
    const res = await attendanceService.getAll();
    const records = (res.data || []).filter(a => a.date >= from && a.date <= to);
    const present = records.filter(a => a.status === 'Present').length;
    const absent = records.filter(a => a.status === 'Absent').length;
    const late = records.filter(a => a.status === 'Late').length;
    const leave = records.filter(a => a.status === 'Leave').length;
    return mockApiCall({ total: records.length, present, absent, late, leave, records });
  }

  async getFeesReport(from: string, to: string) {
    const { feeService } = await import('./fee.service');
    const res = await feeService.getAll();
    const records = (res.data || []).filter(f => (f.paidDate || f.dueDate) >= from && (f.paidDate || f.dueDate) <= to);
    const collected = records.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0);
    const pending = records.filter(f => f.status === 'Pending').reduce((a, f) => a + f.amount, 0);
    const overdue = records.filter(f => f.status === 'Overdue').reduce((a, f) => a + f.amount, 0);
    return mockApiCall({ totalRecords: records.length, collected, pending, overdue, records });
  }

  async getOccupancyReport() {
    const { hostelService } = await import('./hostel.service');
    const res = await hostelService.getAll();
    const hostels = (res.data || []).map(h => ({
      name: h.name,
      capacity: h.capacity,
      occupied: h.occupied,
      percentage: Math.round((h.occupied / h.capacity) * 100),
    }));
    const totalCapacity = hostels.reduce((a, h) => a + h.capacity, 0);
    const totalOccupied = hostels.reduce((a, h) => a + h.occupied, 0);
    return mockApiCall({ hostels, totalCapacity, totalOccupied, overallPercentage: Math.round((totalOccupied / totalCapacity) * 100) });
  }

  async getRevenueReport() {
    const [{ feeService }, { hostelService }] = await Promise.all([import('./fee.service'), import('./hostel.service')]);
    const [feeRes, hostelRes] = await Promise.all([feeService.getAll(), hostelService.getAll()]);
    const fees = feeRes.data || [];
    const hostels = hostelRes.data || [];
    const total = fees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0);
    const pending = fees.filter(f => f.status === 'Pending').reduce((a, f) => a + f.amount, 0);
    const byType = hostels.map(h => ({
      hostel: h.name,
      revenue: fees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0),
    }));
    return mockApiCall({ total, pending, byType });
  }

  async getComplaintsReport() {
    const { complaintService } = await import('./complaint.service');
    const res = await complaintService.getAll();
    const complaints = res.data || [];
    const byCategory = complaints.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byStatus = complaints.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    return mockApiCall({ total: complaints.length, byCategory, byStatus });
  }

  async getVisitorsReport(from: string, to: string) {
    const { visitorService } = await import('./visitor.service');
    const res = await visitorService.getAll();
    const records = (res.data || []).filter(v => v.date >= from && v.date <= to);
    return mockApiCall({ total: records.length, records });
  }

  async getInventoryReport() {
    const { inventoryService } = await import('./inventory.service');
    const res = await inventoryService.getAll();
    const items = res.data || [];
    const lowStock = items.filter(i => i.status === 'Low Stock');
    const byCondition = items.reduce((acc, i) => { acc[i.condition] = (acc[i.condition] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byCategory = items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    return mockApiCall({ total: items.length, lowStock: lowStock.length, available: items.filter(i => i.status === 'Available').length, outOfStock: items.filter(i => i.status === 'Out of Stock').length, byCondition, byCategory });
  }

  async getStudentsReport() {
    const { studentService } = await import('./student.service');
    const res = await studentService.getAll();
    const students = res.data || [];
    const byGender = students.reduce((acc, s) => { acc[s.gender] = (acc[s.gender] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byStatus = students.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byDepartment = students.reduce((acc, s) => { acc[s.department] = (acc[s.department] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byYear = students.reduce((acc, s) => { acc[s.year] = (acc[s.year] || 0) + 1; return acc; }, {} as Record<string, number>);
    const allocated = students.filter(s => s.roomId).length;
    const unallocated = students.filter(s => !s.roomId).length;
    return mockApiCall({ total: students.length, byGender, byStatus, byDepartment, byYear, allocated, unallocated, students });
  }

  async getRoomsReport() {
    const [{ roomService }, { bedService }] = await Promise.all([import('./room.service'), import('./bed.service')]);
    const [roomRes, bedRes] = await Promise.all([roomService.getAll(), bedService.getAll()]);
    const rooms = roomRes.data || [];
    const beds = bedRes.data || [];
    const byType = rooms.reduce((acc, r) => { acc[r.roomType] = (acc[r.roomType] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byStatus = rooms.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalCapacity = rooms.length > 0 ? Math.round(beds.length / rooms.length * 100) / 100 : 0;
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.studentId).length;
    return mockApiCall({ total: rooms.length, totalBeds, occupiedBeds, totalCapacity: totalBeds, byType, byStatus });
  }

  async getBuildingOccupancyReport() {
    const [{ buildingService }, { hostelService }] = await Promise.all([import('./building.service'), import('./hostel.service')]);
    const [buildingRes, hostelRes] = await Promise.all([buildingService.getAll(), hostelService.getAll()]);
    const buildings = buildingRes.data || [];
    const hostels = hostelRes.data || [];
    const withHostel = buildings.map(b => ({ ...b, hostelName: hostels.find(h => h.id === b.hostelId)?.name || 'Unknown' }));
    const totalCapacity = buildings.reduce((a, b) => a + b.capacity, 0);
    const totalOccupied = buildings.reduce((a, b) => a + b.occupiedRooms, 0);
    return mockApiCall({ buildings: withHostel, totalCapacity, totalOccupied, overallPercentage: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0 });
  }

  async getLeaveReport(from: string, to: string) {
    const { leaveService } = await import('./leave.service');
    const res = await leaveService.getAll();
    const records = (res.data || []).filter(l => l.fromDate >= from && l.toDate <= to);
    const byStatus = records.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byType = records.reduce((acc, l) => { acc[l.leaveType] = (acc[l.leaveType] || 0) + 1; return acc; }, {} as Record<string, number>);
    return mockApiCall({ total: records.length, byStatus, byType, records });
  }

  async getMessReport(from: string, to: string) {
    const { messService } = await import('./mess.service');
    const res = await messService.getAll();
    const menu = res.data || [];
    return mockApiCall({ totalMenuItems: menu.length, menu, daysCovered: menu.length });
  }

  async getDocumentsReport() {
    const { documentService } = await import('./document.service');
    const res = await documentService.getAll();
    const docs = res.data || [];
    const byStatus = docs.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byType = docs.reduce((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {} as Record<string, number>);
    return mockApiCall({ total: docs.length, verified: docs.filter(d => d.status === 'Verified').length, rejected: docs.filter(d => d.status === 'Rejected').length, pending: docs.filter(d => d.status === 'Pending').length, byStatus, byType });
  }
}

export const reportService = new ReportService();
