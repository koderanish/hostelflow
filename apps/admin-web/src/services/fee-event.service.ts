import { BaseService } from './base.service';
import { generateId } from '../utils';

type FeeEventType = 'Created' | 'Updated' | 'PaymentReceived' | 'StatusChanged' | 'Deleted';

interface FeeEvent {
  id: string;
  feeId: string;
  eventType: FeeEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  amount?: number;
  details?: string;
}

class FeeEventService extends BaseService<FeeEvent> {
  constructor() {
    super('fee-events', []);
  }

  async log(
    feeId: string,
    eventType: FeeEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    amount?: number,
    details?: string,
  ) {
    const event: FeeEvent = {
      id: generateId(),
      feeId,
      eventType,
      timestamp: new Date().toISOString(),
      performedBy,
      previousStatus,
      newStatus,
      amount,
      details,
    };
    const all = this.getAllFromStorage();
    all.push(event);
    this.saveToStorage(all);
    return { success: true, data: event };
  }

  async getByFee(feeId: string) {
    return this.getByField('feeId', feeId);
  }
}

export const feeEventService = new FeeEventService();
