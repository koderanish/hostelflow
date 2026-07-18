import { BaseService } from './base.service';
import { generateId } from '../utils';

type AttendanceEventType = 'Created' | 'Updated' | 'StatusChanged' | 'BulkMarked' | 'Deleted' | 'Restored';

interface AttendanceEvent {
  id: string;
  attendanceId: string;
  eventType: AttendanceEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class AttendanceEventService extends BaseService<AttendanceEvent> {
  constructor() {
    super('attendance-events', []);
  }

  async log(
    attendanceId: string,
    eventType: AttendanceEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: AttendanceEvent = {
      id: generateId(),
      attendanceId,
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

  async getByAttendance(attendanceId: string) {
    return this.getByField('attendanceId', attendanceId);
  }
}

export const attendanceEventService = new AttendanceEventService();
