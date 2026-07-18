import { BaseService } from './base.service';
import type { InventoryItem } from '../types';
import { INITIAL_INVENTORY } from '../data';
import { generateId } from '../utils';

const LOW_STOCK_THRESHOLD = 10;

class InventoryService extends BaseService<InventoryItem> {
  constructor() {
    super('inventory', INITIAL_INVENTORY as InventoryItem[]);
  }

  private computeStatus(availableQuantity: number): InventoryItem['status'] {
    if (availableQuantity <= 0) return 'Out of Stock';
    if (availableQuantity <= LOW_STOCK_THRESHOLD) return 'Low Stock';
    return 'Available';
  }

  private isItemIssued(items: InventoryItem[], id: string): boolean {
    const item = items.find(i => i.id === id);
    return item ? item.availableQuantity < item.quantity : false;
  }

  async addItem(data: {
    name: string; category: InventoryItem['category'];
    sku?: string; quantity: number;
    unit: string; condition: InventoryItem['condition'];
    location: string; assignedTo?: string;
    purchaseDate?: string; vendor?: string; cost?: number;
  }) {
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: generateId(),
      name: data.name,
      category: data.category,
      sku: data.sku,
      quantity: data.quantity,
      availableQuantity: data.quantity,
      unit: data.unit,
      condition: data.condition,
      location: data.location,
      assignedTo: data.assignedTo,
      purchaseDate: data.purchaseDate,
      vendor: data.vendor,
      cost: data.cost,
      status: this.computeStatus(data.quantity),
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllFromStorage();
    all.push(newItem);
    this.saveToStorage(all);

    const { inventoryEventService } = await import('./inventory-event.service');
    await inventoryEventService.log(newItem.id, 'Created', undefined, data.quantity, undefined, newItem.status, `Item added: ${data.name}`);

    return { success: true, data: newItem };
  }

  async updateItem(id: string, data: Partial<Omit<InventoryItem, 'id' | 'isDeleted' | 'createdAt'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Item not found' };

    // Recompute status if quantity/availableQuantity changed
    if (data.availableQuantity !== undefined) {
      data.status = this.computeStatus(data.availableQuantity);
    } else if (data.quantity !== undefined) {
      // When total quantity changes, adjust availableQuantity proportionally
      const oldItem = all[idx];
      const diff = data.quantity - oldItem.quantity;
      const newAvail = (oldItem.availableQuantity + diff);
      data.availableQuantity = Math.max(0, newAvail);
      data.status = this.computeStatus(data.availableQuantity);
    }

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { inventoryEventService } = await import('./inventory-event.service');
    await inventoryEventService.log(id, 'Updated', undefined, undefined, undefined, all[idx].status, 'Item details updated');

    // Low stock notification
    if (all[idx].status === 'Low Stock' || all[idx].status === 'Out of Stock') {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: 'u1', title: 'Low Stock Alert', message: `"${all[idx].name}" is now ${all[idx].status}. Only ${all[idx].availableQuantity}/${all[idx].quantity} left.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async issueItem(id: string, quantity: number, issuedTo: string, purpose: string) {
    // Business rule: prevent issuing unavailable items
    if (quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than zero' };
    }

    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Item not found' };

    if (all[idx].availableQuantity < quantity) {
      return { success: false, error: `Cannot issue ${quantity} ${all[idx].unit}(s). Only ${all[idx].availableQuantity} available.` };
    }

    // Business rule: quantity cannot go below zero
    const newAvailable = all[idx].availableQuantity - quantity;
    if (newAvailable < 0) {
      return { success: false, error: 'Insufficient quantity available' };
    }

    const oldStatus = all[idx].status;
    all[idx].availableQuantity = newAvailable;
    all[idx].status = this.computeStatus(newAvailable);
    all[idx].updatedAt = new Date().toISOString();
    this.saveToStorage(all);

    const { inventoryEventService } = await import('./inventory-event.service');
    await inventoryEventService.log(
      id, 'Issued', issuedTo, quantity, oldStatus, all[idx].status,
      `Issued ${quantity} ${all[idx].unit}(s) to ${issuedTo} for ${purpose}`
    );

    // Low stock notification
    if (all[idx].status === 'Low Stock' || all[idx].status === 'Out of Stock') {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: 'u1', title: 'Low Stock Alert', message: `"${all[idx].name}" is now ${all[idx].status}. Only ${all[idx].availableQuantity}/${all[idx].quantity} left.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async returnItem(id: string, quantity: number, returnedBy: string) {
    // Business rule: quantity cannot go below zero (negative return not allowed)
    if (quantity <= 0) {
      return { success: false, error: 'Return quantity must be greater than zero' };
    }

    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Item not found' };

    const oldStatus = all[idx].status;
    const newAvailable = Math.min(all[idx].availableQuantity + quantity, all[idx].quantity);
    all[idx].availableQuantity = newAvailable;
    all[idx].status = this.computeStatus(newAvailable);
    all[idx].updatedAt = new Date().toISOString();
    this.saveToStorage(all);

    const { inventoryEventService } = await import('./inventory-event.service');
    await inventoryEventService.log(
      id, 'Returned', returnedBy, quantity, oldStatus, all[idx].status,
      `Returned ${quantity} ${all[idx].unit}(s) by ${returnedBy}`
    );

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Item not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { inventoryEventService } = await import('./inventory-event.service');
    await inventoryEventService.log(id, 'Deleted', undefined, undefined, all[idx].status, undefined, 'Item deleted');

    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Item not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { inventoryEventService } = await import('./inventory-event.service');
    await inventoryEventService.log(id, 'Restored', undefined, undefined, undefined, all[idx].status, 'Item restored');

    return { success: true, data: all[idx] };
  }

  async getHistory(itemId: string) {
    const { inventoryEventService } = await import('./inventory-event.service');
    return inventoryEventService.getByItem(itemId);
  }

  async getByStatus(status: string) {
    const all = this.getAllFromStorage().filter(i => !i.isDeleted);
    return { success: true, data: all.filter(i => i.status === status) };
  }

  async getLowStock() {
    return this.getByStatus('Low Stock');
  }
}

export const inventoryService = new InventoryService();
