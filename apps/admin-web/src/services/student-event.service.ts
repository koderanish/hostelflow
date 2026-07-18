import { BaseService } from './base.service';
import type { StudentEvent, StudentEventType } from '../types';
import { generateId } from '../utils';

class StudentEventService extends BaseService<StudentEvent> {
  constructor() {
    super('student-events', []);
  }

  async log(
    studentId: string,
    eventType: StudentEventType,
    performedBy?: string,
    previousStatus?: string,
    newStatus?: string,
    details?: string,
  ) {
    const event: StudentEvent = {
      id: generateId(),
      studentId,
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

  async getByStudent(studentId: string) {
    return this.getByField('studentId', studentId);
  }
}

export const studentEventService = new StudentEventService();
