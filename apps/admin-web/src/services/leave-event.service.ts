import { BaseService } from './base.service';
import { generateId } from '../utils';

type LeaveEventType = 'Applied' | 'Updated' | 'Approved' | 'Rejected' | 'Cancelled' | 'Deleted' | 'Restored';

interface LeaveEvent {
  id: string;
  leaveId: string;
  eventType: LeaveEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class LeaveEventService extends BaseService<LeaveEvent> {
  constructor() {
    super('leave-events', []);
  }

  async log(
    leaveId: string,
    eventType: LeaveEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: LeaveEvent = {
      id: generateId(),
      leaveId,
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

  async getByLeave(leaveId: string) {
    return this.getByField('leaveId', leaveId);
  }
}

export const leaveEventService = new LeaveEventService();
