import { BaseService } from './base.service';
import { generateId } from '../utils';

type VisitorEventType = 'Registered' | 'Updated' | 'Approved' | 'Rejected' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'Deleted' | 'Restored';

interface VisitorEvent {
  id: string;
  visitorId: string;
  eventType: VisitorEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class VisitorEventService extends BaseService<VisitorEvent> {
  constructor() {
    super('visitor-events', []);
  }

  async log(
    visitorId: string,
    eventType: VisitorEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: VisitorEvent = {
      id: generateId(),
      visitorId,
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

  async getByVisitor(visitorId: string) {
    return this.getByField('visitorId', visitorId);
  }
}

export const visitorEventService = new VisitorEventService();
