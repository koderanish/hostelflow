import { BaseService } from './base.service';
import { Room } from '../types';
import { INITIAL_ROOMS } from '../data';
import { generateId } from '../utils';

const ROOM_TYPE_BED_COUNTS: Record<string, number> = {
  Single: 1,
  Double: 2,
  Triple: 3,
  Dormitory: 4,
};

const ROOM_TRANSITIONS: Record<string, string[]> = {
  Available: ['Reserved', 'Under Maintenance'],
  Reserved: ['Occupied', 'Available'],
  Occupied: ['Available', 'Under Maintenance'],
  'Under Maintenance': ['Available'],
};

function isValidRoomTransition(from: string, to: string): boolean {
  const allowed = ROOM_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

class RoomService extends BaseService<Room> {
  constructor() {
    super('rooms', INITIAL_ROOMS as Room[]);
  }

  async getByHostel(hostelId: string) {
    return this.getByField('hostelId', hostelId);
  }

  async getAvailable() {
    const all = this.getAllFromStorage().filter(r => !r.isDeleted);
    return { success: true, data: all.filter(r => r.status === 'Available') };
  }

  async getByFloor(hostelId: string, floor: number) {
    const all = this.getAllFromStorage().filter(r => !r.isDeleted);
    return { success: true, data: all.filter(r => r.hostelId === hostelId && r.floor === floor) };
  }

  async getByBuilding(buildingId: string) {
    return this.getByField('buildingId', buildingId);
  }

  async createWithBeds(data: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>, roomNo: string) {
    const now = new Date().toISOString();
    const newRoom: Room = {
      ...data,
      id: generateId(),
      roomNo,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    const all = this.getAllFromStorage();
    all.push(newRoom);
    this.saveToStorage(all);

    const { bedService } = await import('./bed.service');
    const bedCount = ROOM_TYPE_BED_COUNTS[data.roomType] || 1;
    await bedService.bulkGenerate(newRoom.id, bedCount, roomNo);

    const { roomEventService } = await import('./room-event.service');
    await roomEventService.log(newRoom.id, 'Created', undefined, undefined, data.status);

    return { success: true, data: newRoom };
  }

  async updateStatus(id: string, newStatus: Room['status'], performedBy?: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Room not found' };

    const oldStatus = all[idx].status;
    if (oldStatus === newStatus) return { success: true, data: all[idx] };

    if (!isValidRoomTransition(oldStatus, newStatus)) {
      return {
        success: false,
        error: `Invalid status transition: ${oldStatus} → ${newStatus}. Allowed: ${(ROOM_TRANSITIONS[oldStatus] || []).join(', ') || 'none'}`,
      };
    }

    all[idx] = { ...all[idx], status: newStatus, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { roomEventService } = await import('./room-event.service');
    await roomEventService.log(id, 'StatusChanged', performedBy, oldStatus, newStatus);

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Room not found' };

    if (all[idx].status === 'Occupied') {
      return { success: false, error: 'Cannot delete an occupied room. Vacate all students first.' };
    }

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { roomEventService } = await import('./room-event.service');
    await roomEventService.log(id, 'StatusChanged', undefined, all[idx].status, undefined, 'Room deleted');

    return { success: true, data: all[idx] };
  }

  async syncOccupancy(roomId: string) {
    const { bedService } = await import('./bed.service');
    const stats = bedService.computeRoomStats(roomId);
    const all = this.getAllFromStorage();
    const idx = all.findIndex(r => r.id === roomId);
    if (idx === -1) return { success: false, error: 'Room not found' };

    const oldStatus = all[idx].status;
    all[idx] = { ...all[idx], status: stats.status, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    if (oldStatus !== stats.status) {
      const { roomEventService } = await import('./room-event.service');
      await roomEventService.log(roomId, 'StatusChanged', undefined, oldStatus, stats.status, 'Derived from bed status');
    }

    return { success: true, data: all[idx] };
  }

  async transferRoom(
    sourceRoomId: string,
    studentId: string,
    targetRoomId: string,
    performedBy?: string,
  ) {
    const { bedService } = await import('./bed.service');
    const { roomEventService } = await import('./room-event.service');

    const allRooms = this.getAllFromStorage();
    const sourceRoom = allRooms.find(r => r.id === sourceRoomId);
    const targetRoom = allRooms.find(r => r.id === targetRoomId);

    if (!sourceRoom) return { success: false, error: 'Source room not found' };
    if (!targetRoom) return { success: false, error: 'Target room not found' };
    if (sourceRoom.isDeleted || targetRoom.isDeleted) return { success: false, error: 'Room is deleted' };

    if (sourceRoom.hostelId !== targetRoom.hostelId) {
      return { success: false, error: 'Cannot transfer across hostels' };
    }

    const { data: sourceBeds } = await bedService.getByRoom(sourceRoomId);
    const occupiedBed = (sourceBeds || []).find(b => b.studentId === studentId);
    if (!occupiedBed) return { success: false, error: 'Student not found in source room' };

    const { data: targetBeds } = await bedService.getAvailableByRoom(targetRoomId);
    if (!targetBeds || targetBeds.length === 0) {
      return { success: false, error: 'No available bed in target room' };
    }

    const { data: allocations } = await this.getAllocations();
    const currentSemesterTransfers = (allocations || []).filter(
      a => a.studentId === studentId && a.status === 'Transferred',
    );
    if (currentSemesterTransfers.length >= 1) {
      return { success: false, error: `Student already transferred ${currentSemesterTransfers.length} time(s) this semester. Only 1 transfer allowed.` };
    }

    await bedService.vacate(occupiedBed.id, performedBy);

    const targetBed = targetBeds[0];
    const allocRes = await bedService.allocate(studentId, targetBed.id, performedBy);
    if (!allocRes.success) return allocRes;

    await this.syncOccupancy(sourceRoomId);
    await this.syncOccupancy(targetRoomId);

    const { data: studentData } = await this.getStudent(studentId);
    if (studentData) {
      studentData.roomId = targetRoomId;
      studentData.roomNo = targetRoom.roomNo;
    }

    const { data: allocationRecords } = await this.getAllocationRecords();
    const activeAlloc = (allocationRecords || []).find(
      a => a.studentId === studentId && a.status === 'Active',
    );
    if (activeAlloc) {
      activeAlloc.status = 'Transferred';
      activeAlloc.dateVacated = new Date().toISOString();
      if (!activeAlloc.transferHistory) activeAlloc.transferHistory = [];
      activeAlloc.transferHistory.push(`Transferred to ${targetRoom.roomNo} (${targetRoomId}) on ${new Date().toISOString()}`);

      const { generateId: genId } = await import('../utils');
      const newAlloc = {
        id: genId(),
        studentId,
        studentName: activeAlloc.studentName,
        hostelId: targetRoom.hostelId,
        hostelName: (await this.getHostelName(targetRoom.hostelId)),
        roomId: targetRoomId,
        roomNo: targetRoom.roomNo,
        bedId: targetBed.id,
        dateAllocated: new Date().toISOString(),
        status: 'Active' as const,
      };
      const initData = await import('../data');
      initData.INITIAL_ALLOCATIONS.push(newAlloc);
    }

    if (sourceRoom.price !== targetRoom.price) {
      await roomEventService.log(
        sourceRoomId,
        'Transferred',
        performedBy,
        undefined,
        undefined,
        `Student ${studentId} transferred from ${sourceRoom.roomNo} to ${targetRoom.roomNo}. Price changed from ₹${sourceRoom.price} to ₹${targetRoom.price}. Fee adjustment may be required.`,
      );
    } else {
      await roomEventService.log(
        sourceRoomId,
        'Transferred',
        performedBy,
        undefined,
        undefined,
        `Student ${studentId} transferred to ${targetRoom.roomNo}`,
      );
    }

    return { success: true, data: { sourceRoom, targetRoom, targetBed } };
  }

  async getHistory(roomId: string) {
    const { roomEventService } = await import('./room-event.service');
    return roomEventService.getRecentByRoom(roomId);
  }

  private async getAllocations() {
    const dm = await import('../data');
    return { success: true, data: dm.INITIAL_ALLOCATIONS || [] };
  }

  private async getAllocationRecords() {
    const dm = await import('../data');
    return { success: true, data: dm.INITIAL_ALLOCATIONS || [] };
  }

  private async getStudent(studentId: string) {
    const dm = await import('../data');
    const student = dm.INITIAL_STUDENTS?.find((s: any) => s.id === studentId);
    return { success: true, data: student || null };
  }

  private async getHostelName(hostelId: string): Promise<string> {
    const dm = await import('../data');
    const hostel = dm.INITIAL_HOSTELS?.find((h: any) => h.id === hostelId);
    return hostel?.name || 'Unknown Hostel';
  }
}

export const roomService = new RoomService();
