import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { AdminDashboardPage } from '../pages/admin/DashboardPage';
import { HostelsPage } from '../pages/admin/HostelsPage';
import { CreateHostelPage } from '../pages/admin/CreateHostelPage';
import { EditHostelPage } from '../pages/admin/EditHostelPage';
import { HostelDetailsPage } from '../pages/admin/HostelDetailsPage';
import { HostelStatisticsPage } from '../pages/admin/HostelStatisticsPage';
import { BuildingsPage } from '../pages/admin/BuildingsPage';
import { CreateBuildingPage } from '../pages/admin/CreateBuildingPage';
import { EditBuildingPage } from '../pages/admin/EditBuildingPage';
import { BuildingDetailsPage } from '../pages/admin/BuildingDetailsPage';
import { BuildingStatisticsPage } from '../pages/admin/BuildingStatisticsPage';
import { RoomsPage } from '../pages/admin/RoomsPage';
import { CreateRoomPage } from '../pages/admin/CreateRoomPage';
import { RoomDetailsPage } from '../pages/admin/RoomDetailsPage';
import { EditRoomPage } from '../pages/admin/EditRoomPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { CreateStudentPage } from '../pages/admin/CreateStudentPage';
import { EditStudentPage } from '../pages/admin/EditStudentPage';
import { StudentDetailsPage } from '../pages/admin/StudentDetailsPage';
import { ApplicationsPage } from '../pages/admin/ApplicationsPage';
import { CreateApplicationPage } from '../pages/admin/CreateApplicationPage';
import { EditApplicationPage } from '../pages/admin/EditApplicationPage';
import { ApplicationDetailsPage } from '../pages/admin/ApplicationDetailsPage';
import { AllocationsPage } from '../pages/admin/AllocationsPage';
import { CreateAllocationPage } from '../pages/admin/CreateAllocationPage';
import { AllocationDetailsPage } from '../pages/admin/AllocationDetailsPage';
import { CreateFeePage } from '../pages/admin/CreateFeePage';
import { EditFeePage } from '../pages/admin/EditFeePage';
import { FeeDetailsPage } from '../pages/admin/FeeDetailsPage';
import { FeesPage } from '../pages/admin/FeesPage';
import { AttendancePage } from '../pages/admin/AttendancePage';
import { MarkAttendancePage } from '../pages/admin/MarkAttendancePage';
import { AttendanceDetailsPage } from '../pages/admin/AttendanceDetailsPage';
import { AttendanceReportsPage } from '../pages/admin/AttendanceReportsPage';
import { LeavePage } from '../pages/admin/LeavePage';
import { ApplyLeavePage } from '../pages/admin/ApplyLeavePage';
import { LeaveDetailsPage } from '../pages/admin/LeaveDetailsPage';
import { ReviewLeavePage } from '../pages/admin/ReviewLeavePage';
import { VisitorsPage } from '../pages/admin/VisitorsPage';
import { RegisterVisitorPage } from '../pages/admin/RegisterVisitorPage';
import { VisitorDetailsPage } from '../pages/admin/VisitorDetailsPage';
import { ApproveVisitorPage } from '../pages/admin/ApproveVisitorPage';
import { ComplaintsPage } from '../pages/admin/ComplaintsPage';
import { CreateComplaintPage } from '../pages/admin/CreateComplaintPage';
import { ComplaintDetailsPage } from '../pages/admin/ComplaintDetailsPage';
import { ResolveComplaintPage } from '../pages/admin/ResolveComplaintPage';
import { InventoryPage } from '../pages/admin/InventoryPage';
import { AddInventoryPage } from '../pages/admin/AddInventoryPage';
import { InventoryDetailsPage } from '../pages/admin/InventoryDetailsPage';
import { IssueInventoryPage } from '../pages/admin/IssueInventoryPage';
import { ReturnInventoryPage } from '../pages/admin/ReturnInventoryPage';
import { MessPage } from '../pages/admin/MessPage';
import { MealPlansPage } from '../pages/admin/MealPlansPage';
import { MealAttendancePage } from '../pages/admin/MealAttendancePage';
import { MealRequestsPage } from '../pages/admin/MealRequestsPage';
import { MealReportsPage } from '../pages/admin/MealReportsPage';
import { DocumentsPage } from '../pages/admin/DocumentsPage';
import { StudentDocumentsPage as AdminStudentDocumentsPage } from '../pages/admin/StudentDocumentsPage';
import { UploadDocumentPage } from '../pages/admin/UploadDocumentPage';
import { DocumentDetailsPage } from '../pages/admin/DocumentDetailsPage';
import { VerifyDocumentPage } from '../pages/admin/VerifyDocumentPage';
import { NotificationsPage } from '../pages/admin/NotificationsPage';
import { NotificationDetailsPage } from '../pages/admin/NotificationDetailsPage';
import { CreateNotificationPage } from '../pages/admin/CreateNotificationPage';
import { NotificationTemplatesPage } from '../pages/admin/NotificationTemplatesPage';
import { StaffPage } from '../pages/admin/StaffPage';
import { NoticesPage } from '../pages/admin/NoticesPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';

import { StudentDashboardPage } from '../pages/student/DashboardPage';
import { StudentApplicationPage } from '../pages/student/ApplicationPage';
import { StudentRoomPage } from '../pages/student/RoomPage';
import { StudentPaymentsPage } from '../pages/student/PaymentsPage';
import { StudentAttendancePage } from '../pages/student/AttendancePage';
import { StudentLeavePage } from '../pages/student/LeavePage';
import { StudentComplaintsPage } from '../pages/student/ComplaintsPage';
import { StudentProfilePage } from '../pages/student/ProfilePage';
import { StudentDocumentsPage } from '../pages/student/DocumentsPage';
import { StudentNotificationsPage } from '../pages/student/NotificationsPage';

import { WardenDashboardPage } from '../pages/warden/DashboardPage';
import { WardenStudentsPage } from '../pages/warden/StudentsPage';
import { WardenRoomsPage } from '../pages/warden/RoomsPage';
import { WardenAttendancePage } from '../pages/warden/AttendancePage';
import { WardenLeaveApprovalPage } from '../pages/warden/LeaveApprovalPage';
import { WardenVisitorsPage } from '../pages/warden/VisitorsPage';
import { WardenComplaintsPage } from '../pages/warden/ComplaintsPage';
import { WardenAllocationsPage } from '../pages/warden/AllocationsPage';
import { StaffDashboardPage } from '../pages/staff/DashboardPage';
import { StaffComplaintsPage } from '../pages/staff/ComplaintsPage';
import { StaffInventoryPage } from '../pages/staff/InventoryPage';
import { StaffNotificationsPage } from '../pages/staff/NotificationsPage';
import { StaffProfilePage } from '../pages/staff/ProfilePage';

import { ChangePasswordPage } from '../pages/profile/ChangePasswordPage';
import { ProfilePage } from '../pages/profile/ProfilePage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-otp', element: <OtpPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { element: <ProtectedRoute roles={['admin']} />, children: [
            { path: 'admin/dashboard', element: <AdminDashboardPage /> },
            { path: 'admin/hostels', element: <HostelsPage /> },
            { path: 'admin/hostels/create', element: <CreateHostelPage /> },
            { path: 'admin/hostels/statistics', element: <HostelStatisticsPage /> },
            { path: 'admin/hostels/:id', element: <HostelDetailsPage /> },
            { path: 'admin/hostels/:id/edit', element: <EditHostelPage /> },
            { path: 'admin/buildings', element: <BuildingsPage /> },
            { path: 'admin/buildings/create', element: <CreateBuildingPage /> },
            { path: 'admin/buildings/statistics', element: <BuildingStatisticsPage /> },
            { path: 'admin/buildings/:id', element: <BuildingDetailsPage /> },
            { path: 'admin/buildings/:id/edit', element: <EditBuildingPage /> },
            { path: 'admin/rooms', element: <RoomsPage /> },
            { path: 'admin/rooms/create', element: <CreateRoomPage /> },
            { path: 'admin/rooms/:id', element: <RoomDetailsPage /> },
            { path: 'admin/rooms/:id/edit', element: <EditRoomPage /> },
            { path: 'admin/students', element: <StudentsPage /> },
            { path: 'admin/students/create', element: <CreateStudentPage /> },
            { path: 'admin/students/statistics', element: <StudentsPage /> },
            { path: 'admin/students/:id', element: <StudentDetailsPage /> },
            { path: 'admin/students/:id/edit', element: <EditStudentPage /> },
            { path: 'admin/applications', element: <ApplicationsPage /> },
            { path: 'admin/applications/create', element: <CreateApplicationPage /> },
            { path: 'admin/applications/:id', element: <ApplicationDetailsPage /> },
            { path: 'admin/applications/:id/edit', element: <EditApplicationPage /> },
            { path: 'admin/allocations', element: <AllocationsPage /> },
            { path: 'admin/allocations/create', element: <CreateAllocationPage /> },
            { path: 'admin/allocations/:id', element: <AllocationDetailsPage /> },
            { path: 'admin/fees', element: <FeesPage /> },
            { path: 'admin/fees/create', element: <CreateFeePage /> },
            { path: 'admin/fees/:id', element: <FeeDetailsPage /> },
            { path: 'admin/fees/:id/edit', element: <EditFeePage /> },
            { path: 'admin/attendance', element: <AttendancePage /> },
            { path: 'admin/attendance/mark', element: <MarkAttendancePage /> },
            { path: 'admin/attendance/reports', element: <AttendanceReportsPage /> },
            { path: 'admin/attendance/:id', element: <AttendanceDetailsPage /> },
            { path: 'admin/leaves', element: <LeavePage /> },
            { path: 'admin/leaves/apply', element: <ApplyLeavePage /> },
            { path: 'admin/leaves/review', element: <LeavePage /> },
            { path: 'admin/leaves/:id', element: <LeaveDetailsPage /> },
            { path: 'admin/leaves/:id/review', element: <ReviewLeavePage /> },
            { path: 'admin/visitors', element: <VisitorsPage /> },
            { path: 'admin/visitors/register', element: <RegisterVisitorPage /> },
            { path: 'admin/visitors/:id', element: <VisitorDetailsPage /> },
            { path: 'admin/visitors/:id/approve', element: <ApproveVisitorPage /> },
            { path: 'admin/complaints', element: <ComplaintsPage /> },
            { path: 'admin/complaints/create', element: <CreateComplaintPage /> },
            { path: 'admin/complaints/:id', element: <ComplaintDetailsPage /> },
            { path: 'admin/complaints/:id/resolve', element: <ResolveComplaintPage /> },
            { path: 'admin/inventory', element: <InventoryPage /> },
            { path: 'admin/inventory/create', element: <AddInventoryPage /> },
            { path: 'admin/inventory/:id', element: <InventoryDetailsPage /> },
            { path: 'admin/inventory/:id/issue', element: <IssueInventoryPage /> },
            { path: 'admin/inventory/:id/return', element: <ReturnInventoryPage /> },
            { path: 'admin/mess', element: <MessPage /> },
            { path: 'admin/mess/meal-plans', element: <MealPlansPage /> },
            { path: 'admin/mess/attendance', element: <MealAttendancePage /> },
            { path: 'admin/mess/requests', element: <MealRequestsPage /> },
            { path: 'admin/mess/reports', element: <MealReportsPage /> },
            { path: 'admin/documents', element: <DocumentsPage /> },
            { path: 'admin/documents/student', element: <AdminStudentDocumentsPage /> },
            { path: 'admin/documents/upload', element: <UploadDocumentPage /> },
            { path: 'admin/documents/:id', element: <DocumentDetailsPage /> },
            { path: 'admin/documents/:id/verify', element: <VerifyDocumentPage /> },
            { path: 'admin/notifications', element: <NotificationsPage /> },
            { path: 'admin/notifications/create', element: <CreateNotificationPage /> },
            { path: 'admin/notifications/templates', element: <NotificationTemplatesPage /> },
            { path: 'admin/notifications/:id', element: <NotificationDetailsPage /> },
            { path: 'admin/reports', element: <ReportsPage /> },
            { path: 'admin/settings', element: <SettingsPage /> },
            { path: 'admin/change-password', element: <ChangePasswordPage /> },
            { path: 'admin/profile', element: <ProfilePage /> },
          ]},
          { element: <ProtectedRoute roles={['student']} />, children: [
            { path: 'student/dashboard', element: <StudentDashboardPage /> },
            { path: 'student/application', element: <StudentApplicationPage /> },
            { path: 'student/room', element: <StudentRoomPage /> },
            { path: 'student/payments', element: <StudentPaymentsPage /> },
            { path: 'student/attendance', element: <StudentAttendancePage /> },
            { path: 'student/leave', element: <StudentLeavePage /> },
            { path: 'student/complaints', element: <StudentComplaintsPage /> },
            { path: 'student/documents', element: <StudentDocumentsPage /> },
            { path: 'student/notifications', element: <StudentNotificationsPage /> },
            { path: 'student/profile', element: <StudentProfilePage /> },
            { path: 'student/change-password', element: <ChangePasswordPage /> },
          ]},
          { element: <ProtectedRoute roles={['warden']} />, children: [
            { path: 'warden/dashboard', element: <WardenDashboardPage /> },
            { path: 'warden/students', element: <WardenStudentsPage /> },
            { path: 'warden/rooms', element: <WardenRoomsPage /> },
            { path: 'warden/attendance', element: <WardenAttendancePage /> },
            { path: 'warden/leave-approval', element: <WardenLeaveApprovalPage /> },
            { path: 'warden/visitors', element: <WardenVisitorsPage /> },
            { path: 'warden/complaints', element: <WardenComplaintsPage /> },
            { path: 'warden/allocations', element: <WardenAllocationsPage /> },
            { path: 'warden/change-password', element: <ChangePasswordPage /> },
          ]},
          { element: <ProtectedRoute roles={['staff']} />, children: [
            { path: 'staff/dashboard', element: <StaffDashboardPage /> },
            { path: 'staff/complaints', element: <StaffComplaintsPage /> },
            { path: 'staff/inventory', element: <StaffInventoryPage /> },
            { path: 'staff/notifications', element: <StaffNotificationsPage /> },
            { path: 'staff/profile', element: <StaffProfilePage /> },
            { path: 'staff/change-password', element: <ChangePasswordPage /> },
          ]},
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
