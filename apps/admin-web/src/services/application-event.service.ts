import { BaseService } from './base.service';
import { generateId } from '../utils';

type ApplicationEventType = 'Created' | 'Updated' | 'StatusChanged' | 'Approved' | 'Rejected' | 'Waitlisted' | 'Cancelled';

interface ApplicationEvent {
  id: string;
  applicationId: string;
  eventType: ApplicationEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class ApplicationEventService extends BaseService<ApplicationEvent> {
  constructor() {
    super('application-events', []);
  }

  async log(
    applicationId: string,
    eventType: ApplicationEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: ApplicationEvent = {
      id: generateId(),
      applicationId,
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

  async getByApplication(applicationId: string) {
    return this.getByField('applicationId', applicationId);
  }
}

export const applicationEventService = new ApplicationEventService();
