import { BaseService } from './base.service';
import type { RoomEvent, RoomEventType } from '../types';
import { generateId } from '../utils';

class RoomEventService extends BaseService<RoomEvent> {
  constructor() {
    super('room-events', []);
  }

  async log(
    roomId: string,
    eventType: RoomEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: RoomEvent = {
      id: generateId(),
      roomId,
      eventType,
      timestamp: new Date().toISOString(),
      performedBy,
      previousStatus,
      newStatus,
      details,
    };
    const all = this.getAllFromStorage();
    all.push(event);
    this.saveToStorage(all);
    return { success: true, data: event };
  }

  async getByRoom(roomId: string) {
    return this.getByField('roomId', roomId);
  }

  async getRecentByRoom(roomId: string, limit = 20) {
    const { data } = await this.getByRoom(roomId);
    const sorted = (data || []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return { success: true, data: sorted.slice(0, limit) };
  }
}

export const roomEventService = new RoomEventService();
