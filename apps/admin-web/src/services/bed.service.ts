import { BaseService } from './base.service';
import { Bed } from '../types';
import { INITIAL_BEDS } from '../data';
import { generateId } from '../utils';

const BED_TRANSITIONS: Record<string, string[]> = {
  Available: ['Occupied', 'Under Maintenance'],
  Occupied: ['Available'],
  'Under Maintenance': ['Available'],
};

function isValidBedTransition(from: string, to: string): boolean {
  const allowed = BED_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

class BedService extends BaseService<Bed> {
  constructor() {
    super('beds', INITIAL_BEDS as Bed[]);
  }

  async getByRoom(roomId: string) {
    return this.getByField('roomId' as keyof Bed, roomId);
  }

  async getAvailableByRoom(roomId: string) {
    const { data } = await this.getByRoom(roomId);
    const available = (data || []).filter(b => b.status === 'Available');
    return { success: true, data: available };
  }

  async allocate(studentId: string, bedId: string, performedBy?: string) {
    const { data: bed } = await this.getById(bedId);
    if (!bed) return { success: false, error: 'Bed not found' };

    if (!isValidBedTransition(bed.status, 'Occupied')) {
      return { success: false, error: `Bed status ${bed.status} cannot transition to Occupied. Allowed transitions from ${bed.status}: ${(BED_TRANSITIONS[bed.status] || []).join(', ') || 'none'}` };
    }
    if (bed.studentId) return { success: false, error: 'Bed already occupied' };

    const allBeds = this.getAllFromStorage();
    const existingAllocation = allBeds.find(b => b.studentId === studentId);
    if (existingAllocation) return { success: false, error: 'Student already allocated to a bed' };

    const dm = await import('../data');

    const student = dm.INITIAL_STUDENTS?.find((s: any) => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    if (student.feeStatus === 'OVERDUE') {
      return { success: false, error: 'Cannot allocate: student has overdue fees. Clear dues before allocation.' };
    }

    const room = dm.INITIAL_ROOMS?.find((r: any) => r.id === bed.roomId);
    if (room) {
      const building = dm.INITIAL_BUILDINGS?.find((b: any) => b.id === room.buildingId);
      if (building && building.gender !== student.gender) {
        return { success: false, error: `Gender mismatch: building is ${building.gender}, student is ${student.gender}` };
      }
    }

    const hasApprovedApp = dm.INITIAL_APPLICATIONS?.some(
      (a: any) => a.studentId === studentId && a.status === 'Approved',
    );
    if (!hasApprovedApp && !existingAllocation) {
      return { success: false, error: 'No approved application found for this student. Application must be approved before allocation.' };
    }

    const idx = allBeds.findIndex(b => b.id === bedId);
    const oldStatus = allBeds[idx].status;
    allBeds[idx] = { ...allBeds[idx], studentId, status: 'Occupied' };
    this.saveToStorage(allBeds);

    const { bedEventService } = await import('./bed-event.service');
    await bedEventService.log(bedId, bed.roomId, 'Allocated', performedBy, studentId, oldStatus, 'Occupied');

    return { success: true, data: allBeds[idx] };
  }

  async vacate(bedId: string, performedBy?: string) {
    const allBeds = this.getAllFromStorage();
    const idx = allBeds.findIndex(b => b.id === bedId);
    if (idx === -1) return { success: false, error: 'Bed not found' };

    const oldStatus = allBeds[idx].status;
    if (!isValidBedTransition(oldStatus, 'Available')) {
      return { success: false, error: `Bed status ${oldStatus} cannot transition to Available. Allowed: ${(BED_TRANSITIONS[oldStatus] || []).join(', ') || 'none'}` };
    }

    const oldStudentId = allBeds[idx].studentId;
    allBeds[idx] = { ...allBeds[idx], studentId: undefined, status: 'Available' };
    this.saveToStorage(allBeds);

    const { bedEventService } = await import('./bed-event.service');
    await bedEventService.log(bedId, allBeds[idx].roomId, 'Vacated', performedBy, oldStudentId, oldStatus, 'Available');

    return { success: true, data: allBeds[idx] };
  }

  async setMaintenance(bedId: string, performedBy?: string) {
    const allBeds = this.getAllFromStorage();
    const idx = allBeds.findIndex(b => b.id === bedId);
    if (idx === -1) return { success: false, error: 'Bed not found' };

    const oldStatus = allBeds[idx].status;
    if (!isValidBedTransition(oldStatus, 'Under Maintenance')) {
      return { success: false, error: `Bed status ${oldStatus} cannot transition to Under Maintenance. Allowed: ${(BED_TRANSITIONS[oldStatus] || []).join(', ') || 'none'}` };
    }

    if (oldStatus === 'Occupied') {
      return { success: false, error: 'Cannot put an occupied bed under maintenance. Vacate the student first.' };
    }

    allBeds[idx] = { ...allBeds[idx], status: 'Under Maintenance' };
    this.saveToStorage(allBeds);

    const { bedEventService } = await import('./bed-event.service');
    await bedEventService.log(bedId, allBeds[idx].roomId, 'StatusChanged', performedBy, undefined, oldStatus, 'Under Maintenance');

    return { success: true, data: allBeds[idx] };
  }

  async restoreBed(bedId: string, performedBy?: string) {
    const allBeds = this.getAllFromStorage();
    const idx = allBeds.findIndex(b => b.id === bedId);
    if (idx === -1) return { success: false, error: 'Bed not found' };

    const oldStatus = allBeds[idx].status;
    if (oldStatus !== 'Under Maintenance') {
      return { success: false, error: `Only beds under maintenance can be restored. Current status: ${oldStatus}` };
    }

    allBeds[idx] = { ...allBeds[idx], status: 'Available' };
    this.saveToStorage(allBeds);

    const { bedEventService } = await import('./bed-event.service');
    await bedEventService.log(bedId, allBeds[idx].roomId, 'StatusChanged', performedBy, undefined, oldStatus, 'Available', 'Restored from maintenance');

    return { success: true, data: allBeds[idx] };
  }

  async bulkGenerate(roomId: string, count: number, prefix: string) {
    const existing = this.getAllFromStorage().filter(b => b.roomId === roomId);
    const start = existing.length + 1;
    const beds: Bed[] = [];

    for (let i = start; i <= count; i++) {
      const bed = {
        id: generateId(),
        roomId,
        bedNo: `${prefix}-${i}`,
        status: 'Available' as const,
      };
      beds.push(bed);

      const { bedEventService } = await import('./bed-event.service');
      await bedEventService.log(bed.id, roomId, 'Created', undefined, undefined, undefined, 'Available');
    }

    const all = this.getAllFromStorage();
    all.push(...beds);
    this.saveToStorage(all);

    return { success: true, data: beds };
  }

  getRoomCapacity(roomId: string): number {
    return this.getAllFromStorage().filter(b => b.roomId === roomId).length;
  }

  getRoomOccupied(roomId: string): number {
    return this.getAllFromStorage().filter(b => b.roomId === roomId && b.studentId).length;
  }

  getRoomStatus(roomId: string): 'Available' | 'Occupied' | 'Under Maintenance' {
    const beds = this.getAllFromStorage().filter(b => b.roomId === roomId);
    if (beds.length === 0) return 'Available';
    if (beds.every(b => b.status === 'Under Maintenance')) return 'Under Maintenance';
    if (beds.some(b => b.status === 'Occupied' || b.studentId)) return 'Occupied';
    return 'Available';
  }

  computeRoomStats(roomId: string) {
    return {
      capacity: this.getRoomCapacity(roomId),
      occupiedBeds: this.getRoomOccupied(roomId),
      status: this.getRoomStatus(roomId),
    };
  }

  async getHistory(bedId: string) {
    const { bedEventService } = await import('./bed-event.service');
    return bedEventService.getByBed(bedId);
  }


}

export const bedService = new BedService();
