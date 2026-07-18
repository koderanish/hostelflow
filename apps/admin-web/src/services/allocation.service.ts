import { BaseService } from './base.service';
import type { RoomAllocation } from '../types';
import { INITIAL_ALLOCATIONS } from '../data';
import { generateId } from '../utils';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  Active: ['Transferred', 'Vacated', 'Cancelled'],
  Transferred: ['Vacated'],
  Vacated: [],
  Cancelled: [],
};

class AllocationService extends BaseService<RoomAllocation> {
  constructor() {
    super('allocations', INITIAL_ALLOCATIONS as RoomAllocation[]);
  }

  async getActive() {
    return this.getAllFromStorage().filter(a => a.status === 'Active' && !a.isDeleted);
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.studentId === studentId) };
  }

  async getByHostel(hostelId: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.hostelId === hostelId) };
  }

  async getByRoom(roomId: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.roomId === roomId) };
  }

  async createAllocation(data: {
    studentId: string; studentName: string;
    applicationId?: string;
    hostelId: string; hostelName: string;
    buildingId?: string;
    roomId: string; roomNo: string;
    bedId: string; bedNo?: string;
    dateAllocated: string;
    expectedVacateDate?: string;
  }) {
    // Business rule: student must exist
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(data.studentId);
    if (!stuRes.success || !stuRes.data || stuRes.data.isDeleted) {
      return { success: false, error: 'Student not found' };
    }

    // Business rule: student can have only one active allocation
    const activeAllocs = await this.getActive();
    const existingActive = activeAllocs.find(a => a.studentId === data.studentId);
    if (existingActive) {
      return { success: false, error: 'Student already has an active allocation' };
    }

    // Business rule: only approved applications can be allocated
    if (data.applicationId) {
      const { applicationService } = await import('./application.service');
      const appRes = await applicationService.getById(data.applicationId);
      if (!appRes.success || !appRes.data) {
        return { success: false, error: 'Application not found' };
      }
      if (appRes.data.status !== 'Approved') {
        return { success: false, error: 'Only approved applications can be allocated' };
      }
    }

    // Business rule: bed must be available
    const { bedService } = await import('./bed.service');
    const bedRes = await bedService.getById(data.bedId);
    if (!bedRes.success || !bedRes.data) {
      return { success: false, error: 'Bed not found' };
    }
    if (bedRes.data.status !== 'Available') {
      return { success: false, error: `Bed is not available. Current status: ${bedRes.data.status}` };
    }

    // Gender validation
    const buildingRes = data.buildingId ? await import('./building.service').then(m => m.buildingService.getById(data.buildingId!)) : null;
    if (buildingRes && buildingRes.success && buildingRes.data && buildingRes.data.gender) {
      if (buildingRes.data.gender !== stuRes.data.gender) {
        return { success: false, error: `Gender mismatch: building is ${buildingRes.data.gender}, student is ${stuRes.data.gender}` };
      }
    }

    const now = new Date().toISOString();
    const newAlloc: RoomAllocation = {
      id: generateId(),
      studentId: data.studentId,
      studentName: data.studentName,
      applicationId: data.applicationId,
      hostelId: data.hostelId,
      hostelName: data.hostelName,
      buildingId: data.buildingId,
      roomId: data.roomId,
      roomNo: data.roomNo,
      bedId: data.bedId,
      bedNo: data.bedNo,
      dateAllocated: data.dateAllocated,
      expectedVacateDate: data.expectedVacateDate,
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    // Allocate the bed via bed service
    const allocRes = await bedService.allocate(data.studentId, data.bedId);
    if (!allocRes.success) {
      return allocRes;
    }

    // Sync room occupancy
    const { roomService } = await import('./room.service');
    await roomService.syncOccupancy(data.roomId);

    // Update student room info
    if (stuRes.success && stuRes.data) {
      await studentService.updateStudent(data.studentId, { hostelId: data.hostelId, roomId: data.roomId, roomNo: data.roomNo });
    }

    const all = this.getAllFromStorage();
    all.push(newAlloc);
    this.saveToStorage(all);

    const { allocationEventService } = await import('./allocation-event.service');
    await allocationEventService.log(newAlloc.id, 'Allocated', undefined, undefined, 'Active', `Allocated to room ${data.roomNo}, bed ${data.bedNo || data.bedId}`);

    // Notify student
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Room Allocated', message: `You have been allocated to ${data.roomNo} in ${data.hostelName}.`, type: 'Room Allocation', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: newAlloc };
  }

  async transferAllocation(id: string, data: {
    roomId: string; roomNo: string; bedId: string; bedNo?: string;
    hostelId: string; hostelName: string; buildingId?: string;
  }) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Allocation not found' };

    const alloc = all[idx];
    if (alloc.isDeleted) return { success: false, error: 'Allocation is deleted' };
    if (alloc.status !== 'Active') return { success: false, error: `Cannot transfer allocation with status '${alloc.status}'. Only active allocations can be transferred.` };

    // Bed must be available
    const { bedService } = await import('./bed.service');
    const bedRes = await bedService.getById(data.bedId);
    if (!bedRes.success || !bedRes.data) return { success: false, error: 'Target bed not found' };
    if (bedRes.data.status !== 'Available') return { success: false, error: `Target bed is not available. Current status: ${bedRes.data.status}` };

    // Release old bed
    if (alloc.bedId) {
      await bedService.vacate(alloc.bedId);
    }

    // Allocate new bed
    const newBedRes = await bedService.allocate(alloc.studentId, data.bedId);
    if (!newBedRes.success) return newBedRes;

    // Mark old allocation as Transferred
    const oldStatus = alloc.status;
    const oldRoomNo = alloc.roomNo;
    const transferNote = `Transferred from ${oldRoomNo} to ${data.roomNo}`;
    if (!alloc.transferHistory) alloc.transferHistory = [];
    alloc.transferHistory.push(`${transferNote} on ${new Date().toISOString()}`);
    all[idx] = {
      ...alloc,
      status: 'Transferred',
      dateVacated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    // Create new active allocation record
    const now = new Date().toISOString();
    const newAlloc: RoomAllocation = {
      id: generateId(),
      studentId: alloc.studentId,
      studentName: alloc.studentName,
      hostelId: data.hostelId,
      hostelName: data.hostelName,
      buildingId: data.buildingId,
      roomId: data.roomId,
      roomNo: data.roomNo,
      bedId: data.bedId,
      bedNo: data.bedNo,
      applicationId: alloc.applicationId,
      dateAllocated: now,
      expectedVacateDate: alloc.expectedVacateDate,
      status: 'Active',
      transferHistory: [`Transferred from ${alloc.roomNo}`],
      createdAt: now,
      updatedAt: now,
    };
    all.push(newAlloc);
    this.saveToStorage(all);

    // Sync room occupancy
    const { roomService } = await import('./room.service');
    await roomService.syncOccupancy(alloc.roomId);
    await roomService.syncOccupancy(data.roomId);

    const { allocationEventService } = await import('./allocation-event.service');
    await allocationEventService.log(alloc.id, 'Transferred', undefined, oldStatus, 'Transferred', transferNote);
    await allocationEventService.log(newAlloc.id, 'Allocated', undefined, undefined, 'Active', transferNote);

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(alloc.studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Room Transferred', message: `You have been transferred from ${oldRoomNo} to ${data.roomNo}.`, type: 'Room Allocation', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: { oldAllocation: all[idx], newAllocation: newAlloc } };
  }

  async vacateAllocation(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Allocation not found' };

    const alloc = all[idx];
    if (alloc.isDeleted) return { success: false, error: 'Allocation is deleted' };

    const allowed = STATUS_TRANSITIONS[alloc.status] || [];
    if (!allowed.includes('Vacated')) {
      return { success: false, error: `Cannot vacate allocation with status '${alloc.status}'. Allowed transitions: ${allowed.join(', ') || 'none'}` };
    }

    // Release the bed
    if (alloc.bedId) {
      const { bedService } = await import('./bed.service');
      await bedService.vacate(alloc.bedId);
    }

    const oldStatus = alloc.status;
    all[idx] = {
      ...alloc,
      status: 'Vacated',
      dateVacated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    // Sync room occupancy
    const { roomService } = await import('./room.service');
    await roomService.syncOccupancy(alloc.roomId);

    const { allocationEventService } = await import('./allocation-event.service');
    await allocationEventService.log(alloc.id, 'Vacated', undefined, oldStatus, 'Vacated');

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(alloc.studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Room Vacated', message: `Your room ${alloc.roomNo} has been vacated.`, type: 'Room Allocation', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async cancelAllocation(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Allocation not found' };

    const alloc = all[idx];
    if (alloc.isDeleted) return { success: false, error: 'Allocation is deleted' };

    const allowed = STATUS_TRANSITIONS[alloc.status] || [];
    if (!allowed.includes('Cancelled')) {
      return { success: false, error: `Cannot cancel allocation with status '${alloc.status}'` };
    }

    // Release the bed if it was occupied
    if (alloc.bedId) {
      const { bedService } = await import('./bed.service');
      await bedService.vacate(alloc.bedId);
    }

    const oldStatus = alloc.status;
    all[idx] = {
      ...alloc,
      status: 'Cancelled',
      dateVacated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { roomService } = await import('./room.service');
    await roomService.syncOccupancy(alloc.roomId);

    const { allocationEventService } = await import('./allocation-event.service');
    await allocationEventService.log(alloc.id, 'Cancelled', undefined, oldStatus, 'Cancelled');

    return { success: true, data: all[idx] };
  }

  async updateAllocation(id: string, data: Partial<Omit<RoomAllocation, 'id' | 'isDeleted'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Allocation not found' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { allocationEventService } = await import('./allocation-event.service');
    await allocationEventService.log(id, 'Updated', undefined, undefined, undefined, 'Allocation details updated');

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Allocation not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Allocation not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async getHistory(allocationId: string) {
    const { allocationEventService } = await import('./allocation-event.service');
    return allocationEventService.getByAllocation(allocationId);
  }
}

export const allocationService = new AllocationService();
