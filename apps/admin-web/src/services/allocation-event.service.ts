import { BaseService } from './base.service';
import { generateId } from '../utils';

type AllocationEventType = 'Created' | 'Updated' | 'StatusChanged' | 'Allocated' | 'Transferred' | 'Vacated' | 'Cancelled';

interface AllocationEvent {
  id: string;
  allocationId: string;
  eventType: AllocationEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class AllocationEventService extends BaseService<AllocationEvent> {
  constructor() {
    super('allocation-events', []);
  }

  async log(
    allocationId: string,
    eventType: AllocationEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: AllocationEvent = {
      id: generateId(),
      allocationId,
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

  async getByAllocation(allocationId: string) {
    return this.getByField('allocationId', allocationId);
  }
}

export const allocationEventService = new AllocationEventService();
