import { BaseService } from './base.service';
import type { BedEvent, BedEventType } from '../types';
import { generateId } from '../utils';

class BedEventService extends BaseService<BedEvent> {
  constructor() {
    super('bed-events', []);
  }

  async log(
    bedId: string,
    roomId: string,
    eventType: BedEventType,
    performedBy?: string,
    studentId?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: BedEvent = {
      id: generateId(),
      bedId,
      roomId,
      eventType,
      timestamp: new Date().toISOString(),
      performedBy,
      studentId,
      previousStatus,
      newStatus,
      details,
    };
    const all = this.getAllFromStorage();
    all.push(event);
    this.saveToStorage(all);
    return { success: true, data: event };
  }

  async getByBed(bedId: string) {
    return this.getByField('bedId', bedId);
  }

  async getByRoom(roomId: string) {
    return this.getByField('roomId', roomId);
  }
}

export const bedEventService = new BedEventService();
