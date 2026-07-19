import type { ApiResponse } from './types';
import { studentService } from './student.service';
import { roomService } from './room.service';
import { paymentService } from './payment.service';

export interface DashboardData {
  student: {
    name: string;
    email: string;
    phone: string;
    course: string;
    year: string;
    enrollmentNo: string;
    hostelName?: string;
    roomNo?: string;
    status: string;
  } | null;
  room: {
    roomNo: string;
    roomType: string;
    status: string;
    floor: number;
    amenities: string[];
    price: number;
  } | null;
  payments: {
    outstandingBalance: number;
    dueDate: string;
    recentPayments: {
      id: string;
      amount: number;
      status: string;
      dueDate: string;
      feeType: string;
    }[];
  };
}

class DashboardService {
  async getDashboard(studentId: string): Promise<ApiResponse<DashboardData>> {
    try {
      const [studentRes, roomRes, paymentRes] = await Promise.all([
        studentService.getById(studentId),
        roomService.getByStudentId(studentId),
        paymentService.getByStudent(studentId),
      ]);

      const payments = (paymentRes.data || []).reduce(
        (acc, p) => {
          if (p.status === 'Pending' || p.status === 'Overdue' || p.status === 'Partial') {
            acc.outstandingBalance += (p.balance ?? p.amount - (p.paidAmount ?? 0));
            if (!acc.dueDate || p.dueDate < acc.dueDate) acc.dueDate = p.dueDate;
          }
          acc.recentPayments.push({
            id: p.id,
            amount: p.amount,
            status: p.status,
            dueDate: p.dueDate,
            feeType: p.feeType,
          });
          return acc;
        },
        { outstandingBalance: 0, dueDate: '', recentPayments: [] } as DashboardData['payments']
      );

      return {
        success: true,
        data: {
          student: studentRes.success && studentRes.data
            ? {
                name: studentRes.data.fullName || studentRes.data.name || '',
                email: studentRes.data.email,
                phone: studentRes.data.phone,
                course: studentRes.data.course,
                year: studentRes.data.year,
                enrollmentNo: studentRes.data.enrollmentNo,
                hostelName: studentRes.data.hostelName,
                roomNo: studentRes.data.roomNo,
                status: studentRes.data.status,
              }
            : null,
          room: roomRes.success && roomRes.data
            ? {
                roomNo: roomRes.data.roomNo,
                roomType: roomRes.data.roomType,
                status: roomRes.data.status,
                floor: roomRes.data.floor,
                amenities: roomRes.data.amenities || [],
                price: roomRes.data.price,
              }
            : null,
          payments,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to load dashboard' };
    }
  }
}

export const dashboardService = new DashboardService();
