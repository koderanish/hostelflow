import { api } from '../api/client';
import type { ApiResponse } from './types';

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  feeType: string;
  amount: number;
  paidAmount?: number;
  balance?: number;
  dueDate: string;
  status: string;
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  invoiceId?: string;
  period?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName?: string;
  invoiceNo: string;
  items: { description: string; amount: number }[];
  totalAmount: number;
  dueDate: string;
  status: string;
  generatedDate: string;
}

export interface PaymentHistoryEntry {
  id: string;
  invoiceId?: string;
  studentId: string;
  receiptNo?: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paidDate: string;
  status: string;
  description?: string;
}

class PaymentService {
  async getByStudent(studentId: string): Promise<ApiResponse<Payment[]>> {
    try {
      const response = await api.get(`/payments?studentId=${studentId}`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch payments' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch payments' };
    }
  }

  async getInvoices(studentId: string): Promise<ApiResponse<Invoice[]>> {
    try {
      const response = await api.get(`/payments/invoices?studentId=${studentId}`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch invoices' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch invoices' };
    }
  }

  async getPaymentHistory(studentId: string): Promise<ApiResponse<PaymentHistoryEntry[]>> {
    try {
      const response = await api.get(`/payments/history?studentId=${studentId}`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch payment history' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch payment history' };
    }
  }
}

export const paymentService = new PaymentService();
