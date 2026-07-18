import { BaseService } from './base.service';
import type { StudentDocument } from '../types';
import { INITIAL_STUDENT_DOCUMENTS } from '../data';
import { studentService } from './student.service';
import { generateId } from '../utils';

interface DocumentEvent {
  id: string;
  documentId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

class DocumentEventService extends BaseService<DocumentEvent> {
  constructor() { super('document-events', []); }

  async log(documentId: string, eventType: string, performedBy?: string, previousStatus?: string, newStatus?: string, details?: string) {
    const evt: DocumentEvent = {
      id: generateId(), documentId, eventType,
      timestamp: new Date().toISOString(), performedBy, previousStatus, newStatus, details,
    };
    const all = this.getAllFromStorage();
    all.push(evt);
    this.saveToStorage(all);
  }

  async getByDocument(documentId: string) {
    return this.getByField('documentId', documentId);
  }
}

// Business rule: Student must exist
// Business rule: Duplicate document type per student not allowed unless replacing
// Business rule: Rejection requires remarks
// Business rule: Verified documents become read-only
class DocumentService extends BaseService<StudentDocument> {
  private eventService: DocumentEventService;

  constructor() {
    super('studentDocuments', INITIAL_STUDENT_DOCUMENTS as StudentDocument[]);
    this.eventService = new DocumentEventService();
  }

  async upload(data: {
    studentId: string; studentName: string; fileName: string;
    type: StudentDocument['type']; fileUrl?: string;
  }) {
    // Student must exist
    const stuRes = await studentService.getById(data.studentId);
    if (!stuRes.success) return { success: false, error: 'Student not found' };

    // Duplicate document type per student not allowed unless replacing
    const all = this.getAllFromStorage();
    const existing = all.find(d => d.studentId === data.studentId && d.type === data.type && !d.isDeleted);
    if (existing && existing.status === 'Verified') {
      return { success: false, error: `A verified ${data.type} document already exists for this student` };
    }

    const now = new Date().toISOString();
    const doc: StudentDocument = {
      id: generateId(),
      studentId: data.studentId,
      studentName: data.studentName,
      fileName: data.fileName,
      type: data.type,
      status: 'Pending',
      fileUrl: data.fileUrl || '',
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    all.push(doc);
    this.saveToStorage(all);
    await this.eventService.log(doc.id, 'Uploaded', undefined, undefined, 'Pending', `Document uploaded: ${data.fileName}`);
    return { success: true, data: doc };
  }

  // Verified documents become read-only
  async update(id: string, data: Partial<Omit<StudentDocument, 'id' | 'isDeleted' | 'createdAt'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return { success: false, error: 'Document not found' };
    if (all[idx].status === 'Verified') return { success: false, error: 'Verified documents cannot be modified' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    await this.eventService.log(id, 'Updated', undefined, undefined, all[idx].status, 'Document updated');
    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return { success: false, error: 'Document not found' };
    if (all[idx].status === 'Verified') return { success: false, error: 'Verified documents cannot be deleted' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    await this.eventService.log(id, 'Deleted', undefined, all[idx].status, undefined, 'Document deleted');
    return { success: true, data: all[idx] };
  }

  // Business rule: Rejection requires remarks
  async verify(id: string, verifiedBy: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return { success: false, error: 'Document not found' };
    if (all[idx].status === 'Verified') return { success: false, error: 'Document is already verified' };
    if (all[idx].status === 'Rejected') return { success: false, error: 'Rejected documents must be re-uploaded' };

    const oldStatus = all[idx].status;
    const now = new Date().toISOString();
    all[idx] = {
      ...all[idx],
      status: 'Verified',
      verifiedAt: now,
      verifiedBy,
      updatedAt: now,
    };
    this.saveToStorage(all);
    await this.eventService.log(id, 'Verified', verifiedBy, oldStatus, 'Verified', 'Document verified');

    // Notify student
    const { notificationService } = await import('./notification.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      await notificationService.add({ userId: stuRes.data.userId, title: 'Document Verified', message: `Your ${all[idx].type} document has been verified.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  // Business rule: Rejection requires remarks
  async reject(id: string, verifiedBy: string, remarks: string) {
    if (!remarks.trim()) return { success: false, error: 'Remarks are required for rejection' };

    const all = this.getAllFromStorage();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return { success: false, error: 'Document not found' };
    if (all[idx].status === 'Verified') return { success: false, error: 'Verified documents cannot be rejected' };
    if (all[idx].status === 'Rejected') return { success: false, error: 'Document is already rejected' };

    const oldStatus = all[idx].status;
    const now = new Date().toISOString();
    all[idx] = {
      ...all[idx],
      status: 'Rejected',
      verifiedAt: now,
      verifiedBy,
      remarks,
      updatedAt: now,
    };
    this.saveToStorage(all);
    await this.eventService.log(id, 'Rejected', verifiedBy, oldStatus, 'Rejected', remarks);

    // Notify student
    const { notificationService } = await import('./notification.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      await notificationService.add({ userId: stuRes.data.userId, title: 'Document Rejected', message: `Your ${all[idx].type} document has been rejected. Reason: ${remarks}`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(d => d.studentId === studentId && !d.isDeleted);
    return { success: true, data: all };
  }

  async getByStatus(status: string) {
    const all = this.getAllFromStorage().filter(d => !d.isDeleted);
    return { success: true, data: all.filter(d => d.status === status) };
  }

  async getByType(type: string) {
    const all = this.getAllFromStorage().filter(d => !d.isDeleted);
    return { success: true, data: all.filter(d => d.type === type) };
  }

  async getHistory(documentId: string) {
    return this.eventService.getByDocument(documentId);
  }

  async getAllHistory() {
    const all = this.eventService.getAllFromStorage() as DocumentEvent[];
    return { success: true, data: all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
  }
}

export const documentService = new DocumentService();
