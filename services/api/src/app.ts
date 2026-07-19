import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

import authRoutes from './modules/auth/auth.routes';
import studentRoutes from './modules/students/student.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import complaintRoutes from './modules/complaints/complaint.routes';
import visitorRoutes from './modules/visitors/visitor.routes';
import leaveRoutes from './modules/leaves/leave.routes';
import messRoutes from './modules/mess/mess.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import hostelRoutes from './modules/hostels/hostel.routes';
import roomRoutes from './modules/rooms/room.routes';
import allocationRoutes from './modules/allocations/allocation.routes';
import applicationRoutes from './modules/applications/application.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import paymentRoutes from './modules/payments/payment.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import userRoutes from './modules/users/user.routes';
import reportRoutes from './modules/reports/report.routes';
import documentRoutes from './modules/documents/document.routes';
import settingRoutes from './modules/settings/setting.routes';
import announcementRoutes from './modules/announcements/announcement.routes';
import buildingRoutes from './modules/buildings/building.routes';
import floorRoutes from './modules/floors/floor.routes';
import bedRoutes from './modules/beds/bed.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import auditRoutes from './modules/audit-logs/audit.routes';

const app = express();

app.set('trust proxy', 1);
app.set('etag', false);

app.get('/favicon.ico', (_req, res) => res.status(204).end());
app.get('/favicon.png', (_req, res) => res.status(204).end());

// ---------------------------------------------------------------------------
// CORS – belt-and-suspenders approach
// ---------------------------------------------------------------------------
// 1) Manual middleware guarantees CORS headers for EVERY response, including
//    errors, regardless of whether cors() below works correctly on Vercel.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// 2) cors() npm package with config-based origin (function or whitelist)
const corsOptions: cors.CorsOptions = {
  origin: config.cors.origins,
  credentials: true,
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
// ---------------------------------------------------------------------------

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Public routes
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use('/api/v1/students', authenticate, studentRoutes);
app.use('/api/v1/attendance', authenticate, attendanceRoutes);
app.use('/api/v1/complaints', authenticate, complaintRoutes);
app.use('/api/v1/visitors', authenticate, visitorRoutes);
app.use('/api/v1/leaves', authenticate, leaveRoutes);
app.use('/api/v1/mess', authenticate, messRoutes);
app.use('/api/v1/notifications', authenticate, notificationRoutes);
app.use('/api/v1/hostels', authenticate, hostelRoutes);
app.use('/api/v1/rooms', authenticate, roomRoutes);
app.use('/api/v1/allocations', authenticate, allocationRoutes);
app.use('/api/v1/applications', authenticate, applicationRoutes);
app.use('/api/v1/dashboard', authenticate, dashboardRoutes);
app.use('/api/v1/payments', authenticate, paymentRoutes);
app.use('/api/v1/inventory', authenticate, inventoryRoutes);
app.use('/api/v1/users', authenticate, userRoutes);
app.use('/api/v1/reports', authenticate, reportRoutes);
app.use('/api/v1/documents', authenticate, documentRoutes);
app.use('/api/v1/settings', authenticate, settingRoutes);
app.use('/api/v1/announcements', authenticate, announcementRoutes);
app.use('/api/v1/buildings', authenticate, buildingRoutes);
app.use('/api/v1/floors', authenticate, floorRoutes);
app.use('/api/v1/beds', authenticate, bedRoutes);
app.use('/api/v1/maintenance', authenticate, maintenanceRoutes);
app.use('/api/v1/audit-logs', authenticate, auditRoutes);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
