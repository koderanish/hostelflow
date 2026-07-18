import { BaseService } from './base.service';
import { generateId } from '../utils';

type InventoryEventType = 'Created' | 'Updated' | 'Issued' | 'Returned' | 'StatusChanged' | 'Deleted' | 'Restored';

interface InventoryEvent {
  id: string;
  itemId: string;
  eventType: InventoryEventType;
  timestamp: string;
  performedBy?: string;
  quantity?: number;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class InventoryEventService extends BaseService<InventoryEvent> {
  constructor() {
    super('inventory-events', []);
  }

  async log(
    itemId: string,
    eventType: InventoryEventType,
    performedBy?: string,
    quantity?: number,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: InventoryEvent = {
      id: generateId(),
      itemId,
      eventType,
      timestamp: new Date().toISOString(),
      performedBy,
      quantity,
      previousStatus,
      newStatus,
      details,
    };
    const all = this.getAllFromStorage();
    all.push(event);
    this.saveToStorage(all);
    return { success: true, data: event };
  }

  async getByItem(itemId: string) {
    return this.getByField('itemId', itemId);
  }
}

export const inventoryEventService = new InventoryEventService();
