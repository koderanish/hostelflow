import { BaseService } from './base.service';
import { generateId } from '../utils';

type ComplaintEventType = 'Created' | 'Updated' | 'StatusChanged' | 'Assigned' | 'Resolved' | 'Closed' | 'Rejected' | 'Deleted' | 'Restored';

interface ComplaintEvent {
  id: string;
  complaintId: string;
  eventType: ComplaintEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class ComplaintEventService extends BaseService<ComplaintEvent> {
  constructor() {
    super('complaint-events', []);
  }

  async log(
    complaintId: string,
    eventType: ComplaintEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: ComplaintEvent = {
      id: generateId(),
      complaintId,
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

  async getByComplaint(complaintId: string) {
    return this.getByField('complaintId', complaintId);
  }
}

export const complaintEventService = new ComplaintEventService();
