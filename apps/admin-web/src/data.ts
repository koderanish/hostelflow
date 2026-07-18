import { User, Student, StudentDocument, StudentEvent, Hostel, Building, Room, Bed, HostelApplication, RoomAllocation, Fee, Attendance, LeaveRequest, Visitor, Complaint, MessMenu, MealRequest, InventoryItem, Notification, NotificationMessage, NotificationTemplate, EmergencyAlert, Document, Staff, Notice, InstituteSettings, HostelSettings, SystemPreferences, Role, AuditLogEntry, BackupRecord, SMTPConfig, CloudinaryConfig, RazorpayConfig } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@hostelflow.com', password: 'admin123', name: 'Admin User', role: 'admin', phone: '9999999999', isActive: true },
  { id: 'u2', email: 'warden@hostelflow.com', password: 'warden123', name: 'Mr. Sharma', role: 'warden', phone: '9999999998', isActive: true },
  { id: 'u3', email: 'staff@hostelflow.com', password: 'staff123', name: 'Raj Kumar', role: 'staff', phone: '9999999997', isActive: true },
  { id: 'u4', email: 'student@hostelflow.com', password: 'student123', name: 'Rahul Kumar', role: 'student', phone: '9999999996', isActive: true },
];

export const INITIAL_HOSTELS: Hostel[] = [
  { id: 'h1', name: 'Boys Hostel A', type: 'Boys', gender: 'Male', capacity: 500, occupied: 423, address: 'North Campus', wardenId: 'u2', wardenName: 'Mr. Sharma', status: 'Active', floors: 5, buildings: 2, facilities: ['Laundry', 'Gym', 'Library'] },
  { id: 'h2', name: 'Girls Hostel B', type: 'Girls', gender: 'Female', capacity: 300, occupied: 287, address: 'South Campus', wardenId: 'u2', wardenName: 'Mrs. Gupta', status: 'Active', floors: 4, buildings: 1, facilities: ['Common Room'] },
  { id: 'h3', name: 'Boys Hostel C', type: 'Boys', gender: 'Male', capacity: 200, occupied: 98, address: 'East Wing', wardenId: 'u2', wardenName: 'Mr. Verma', status: 'Maintenance', floors: 3, buildings: 1, facilities: [] },
];

export const INITIAL_BUILDINGS: Building[] = [
  { id: 'b1', hostelId: 'h1', name: 'Block A', code: 'BLK-A', description: 'Main academic block with administration', gender: 'Male', floors: 5, capacity: 200, occupiedRooms: 32, availableRooms: 8, status: 'Active', wardenId: 'u2', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
  { id: 'b2', hostelId: 'h1', name: 'Block B', code: 'BLK-B', description: 'Senior students wing', gender: 'Male', floors: 4, capacity: 150, occupiedRooms: 28, availableRooms: 2, status: 'Active', wardenId: 'u2', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-10T00:00:00Z' },
  { id: 'b3', hostelId: 'h2', name: 'Block C', code: 'BLK-C', description: 'Girls hostel wing', gender: 'Female', floors: 4, capacity: 120, occupiedRooms: 24, availableRooms: 6, status: 'Active', wardenId: 'u2', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
  { id: 'b4', hostelId: 'h1', name: 'Annexe', code: 'ANX-A', description: 'New annexe building under renovation', gender: 'Male', floors: 3, capacity: 80, occupiedRooms: 0, availableRooms: 20, status: 'Maintenance', wardenId: 'u2', createdAt: '2024-03-15T00:00:00Z', updatedAt: '2024-05-20T00:00:00Z' },
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', hostelId: 'h1', buildingId: 'b1', roomNo: 'A-101', floor: 1, roomType: 'Double', status: 'Occupied', amenities: ['Bed', 'Table', 'Chair', 'Fan'], price: 12000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
  { id: 'r2', hostelId: 'h1', buildingId: 'b1', roomNo: 'A-102', floor: 1, roomType: 'Triple', status: 'Occupied', amenities: ['Bed', 'Table', 'Chair', 'Fan'], price: 9000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-05T00:00:00Z' },
  { id: 'r3', hostelId: 'h1', buildingId: 'b1', roomNo: 'A-103', floor: 1, roomType: 'Single', status: 'Available', amenities: ['Bed', 'Table', 'Chair', 'Fan', 'AC'], price: 18000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'r4', hostelId: 'h1', buildingId: 'b2', roomNo: 'B-201', floor: 2, roomType: 'Dormitory', status: 'Occupied', amenities: ['Bed', 'Table', 'Chair', 'Fan'], price: 6000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-10T00:00:00Z' },
  { id: 'r5', hostelId: 'h1', buildingId: 'b2', roomNo: 'B-202', floor: 2, roomType: 'Double', status: 'Under Maintenance', amenities: ['Bed', 'Table', 'Chair', 'Fan'], price: 12000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-05-20T00:00:00Z' },
  { id: 'r6', hostelId: 'h2', buildingId: 'b3', roomNo: 'C-101', floor: 1, roomType: 'Double', status: 'Occupied', amenities: ['Bed', 'Table', 'Chair', 'Fan', 'AC'], price: 15000, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
  { id: 'r7', hostelId: 'h2', buildingId: 'b3', roomNo: 'C-102', floor: 1, roomType: 'Single', status: 'Available', amenities: ['Bed', 'Table', 'Chair', 'Fan', 'AC'], price: 20000, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
];

export const INITIAL_BEDS: Bed[] = [
  { id: 'bed1', roomId: 'r1', bedNo: 'A-101-1', status: 'Occupied', studentId: 's1' },
  { id: 'bed2', roomId: 'r1', bedNo: 'A-101-2', status: 'Occupied', studentId: 's2' },
  { id: 'bed3', roomId: 'r2', bedNo: 'A-102-1', status: 'Occupied', studentId: 's3' },
  { id: 'bed4', roomId: 'r2', bedNo: 'A-102-2', status: 'Available' },
  { id: 'bed5', roomId: 'r2', bedNo: 'A-102-3', status: 'Available' },
  { id: 'bed6', roomId: 'r3', bedNo: 'A-103-1', status: 'Available' },
  { id: 'bed7', roomId: 'r4', bedNo: 'B-201-1', status: 'Occupied', studentId: 's4' },
  { id: 'bed8', roomId: 'r4', bedNo: 'B-201-2', status: 'Occupied', studentId: 's5' },
  { id: 'bed9', roomId: 'r4', bedNo: 'B-201-3', status: 'Occupied', studentId: 's6' },
  { id: 'bed10', roomId: 'r4', bedNo: 'B-201-4', status: 'Occupied', studentId: 's7' },
  { id: 'bed11', roomId: 'r5', bedNo: 'B-202-1', status: 'Under Maintenance' },
  { id: 'bed12', roomId: 'r5', bedNo: 'B-202-2', status: 'Under Maintenance' },
  { id: 'bed13', roomId: 'r6', bedNo: 'C-101-1', status: 'Occupied', studentId: 's8' },
  { id: 'bed14', roomId: 'r6', bedNo: 'C-101-2', status: 'Occupied', studentId: 's9' },
  { id: 'bed15', roomId: 'r7', bedNo: 'C-102-1', status: 'Available' },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's1', userId: 'u4', name: 'Rahul Kumar', email: 'rahul@hostelflow.com', phone: '9876543210', gender: 'Male', dob: '2004-05-15', bloodGroup: 'B+', address: 'Delhi', enrollmentNo: '2024CS001', registrationNo: 'REG24001', department: 'Computer Science', course: 'B.Tech Computer Science', year: '2nd Year', semester: 'Sem 3', parentName: 'Mr. Rajesh Kumar', parentContact: '9876543210', emergencyContactName: 'Mrs. Sunita Kumar', emergencyContactPhone: '9876543200', emergencyContactRelation: 'Mother', hostelId: 'h1', roomId: 'r1', roomNo: 'A-101', status: 'Active', feeStatus: 'PAID', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's2', name: 'Amit Singh', email: 'amit@hostelflow.com', phone: '9876543211', gender: 'Male', dob: '2004-07-20', bloodGroup: 'O+', address: 'Lucknow', enrollmentNo: '2024CS002', department: 'Computer Science', course: 'B.Tech Computer Science', year: '2nd Year', semester: 'Sem 3', parentName: 'Mr. Suresh Singh', parentContact: '9876543211', emergencyContactName: 'Mrs. Priya Singh', emergencyContactPhone: '9876543219', emergencyContactRelation: 'Mother', hostelId: 'h1', roomId: 'r1', roomNo: 'A-101', status: 'Active', feeStatus: 'PENDING', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's3', name: 'Vikram Patel', email: 'vikram@hostelflow.com', phone: '9876543212', gender: 'Male', dob: '2003-02-10', bloodGroup: 'A+', address: 'Mumbai', enrollmentNo: '2024CS003', department: 'IT', course: 'B.Tech Information Technology', year: '3rd Year', semester: 'Sem 5', parentName: 'Mr. Vikram Patel', parentContact: '9876543212', emergencyContactName: 'Mrs. Anjali Patel', emergencyContactPhone: '9876543220', emergencyContactRelation: 'Mother', hostelId: 'h1', roomId: 'r2', roomNo: 'A-102', status: 'Active', feeStatus: 'PAID', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's4', name: 'Suresh Reddy', email: 'suresh@hostelflow.com', phone: '9876543213', gender: 'Male', dob: '2005-11-05', bloodGroup: 'AB+', address: 'Hyderabad', enrollmentNo: '2024ME001', department: 'Mechanical', course: 'B.Tech Mechanical', year: '1st Year', semester: 'Sem 1', parentName: 'Mr. Reddy', parentContact: '9876543213', emergencyContactName: 'Mrs. Lakshmi Reddy', emergencyContactPhone: '9876543221', emergencyContactRelation: 'Mother', hostelId: 'h1', roomId: 'r4', roomNo: 'B-201', status: 'Active', feeStatus: 'OVERDUE', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's5', name: 'Deepak Joshi', email: 'deepak@hostelflow.com', phone: '9876543214', gender: 'Male', dob: '2003-08-15', bloodGroup: 'B-', address: 'Jaipur', enrollmentNo: '2024EE001', department: 'Electrical', course: 'B.Tech Electrical', year: '3rd Year', semester: 'Sem 5', parentName: 'Mr. Joshi', parentContact: '9876543214', emergencyContactName: 'Mrs. Uma Joshi', emergencyContactPhone: '9876543222', emergencyContactRelation: 'Mother', hostelId: 'h1', roomId: 'r4', roomNo: 'B-201', status: 'Active', feeStatus: 'PAID', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's6', name: 'Manish Yadav', email: 'manish@hostelflow.com', phone: '9876543215', gender: 'Male', dob: '2002-12-25', bloodGroup: 'O-', address: 'Patna', enrollmentNo: '2024CS004', department: 'Computer Science', course: 'B.Tech Computer Science', year: '4th Year', semester: 'Sem 7', parentName: 'Mr. Yadav', parentContact: '9876543215', emergencyContactName: 'Mrs. Sarita Yadav', emergencyContactPhone: '9876543223', emergencyContactRelation: 'Mother', hostelId: 'h1', roomId: 'r4', roomNo: 'B-201', status: 'Active', feeStatus: 'PENDING', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's7', name: 'Ravi Shankar', email: 'ravi@hostelflow.com', phone: '9876543216', gender: 'Male', dob: '2004-03-30', bloodGroup: 'A-', address: 'Bhopal', enrollmentNo: '2024CE001', department: 'Civil', course: 'B.Tech Civil', year: '2nd Year', semester: 'Sem 3', parentName: 'Mr. Shankar', parentContact: '9876543216', emergencyContactName: 'Mrs. Kavita Shankar', emergencyContactPhone: '9876543224', emergencyContactRelation: 'Mother', hostelId: 'h1', roomId: 'r4', roomNo: 'B-201', status: 'Active', feeStatus: 'PAID', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's8', userId: '', name: 'Priya Sharma', email: 'priya@hostelflow.com', phone: '9876543217', gender: 'Female', dob: '2004-06-18', bloodGroup: 'AB-', address: 'Chandigarh', enrollmentNo: '2024BT001', department: 'Biotechnology', course: 'B.Tech Biotechnology', year: '2nd Year', semester: 'Sem 3', parentName: 'Mrs. Sharma', parentContact: '9876543217', emergencyContactName: 'Mr. Raj Sharma', emergencyContactPhone: '9876543225', emergencyContactRelation: 'Father', hostelId: 'h2', roomId: 'r6', roomNo: 'C-101', status: 'Active', feeStatus: 'PAID', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's9', name: 'Neha Gupta', email: 'neha@hostelflow.com', phone: '9876543218', gender: 'Female', dob: '2005-09-12', bloodGroup: 'B+', address: 'Pune', enrollmentNo: '2024BT002', department: 'Biotechnology', course: 'B.Tech Biotechnology', year: '1st Year', semester: 'Sem 1', parentName: 'Mrs. Gupta', parentContact: '9876543218', emergencyContactName: 'Mr. Ravi Gupta', emergencyContactPhone: '9876543226', emergencyContactRelation: 'Father', hostelId: 'h2', roomId: 'r6', roomNo: 'C-101', status: 'Active', feeStatus: 'PENDING', admissionDate: '2024-06-01', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 's10', name: 'Arun Verma', email: 'arun@hostelflow.com', phone: '9876543219', gender: 'Male', dob: '2005-01-15', address: 'Varanasi', enrollmentNo: '2024CS005', department: 'Computer Science', course: 'B.Tech Computer Science', year: '1st Year', semester: 'Sem 1', parentName: 'Mr. Arun Verma', parentContact: '9876543227', emergencyContactName: 'Mrs. Suman Verma', emergencyContactPhone: '9876543228', emergencyContactRelation: 'Mother', status: 'Active', feeStatus: 'PENDING', admissionDate: '2024-07-01', createdAt: '2024-07-01T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
];

export const INITIAL_APPLICATIONS: HostelApplication[] = [
  { id: 'a1', studentId: 's10', studentName: 'Arun Verma', course: 'B.Tech Computer Science', year: '1st Year', preferredHostelId: 'h1', preferredHostel: 'Boys Hostel A', preferredRoomType: 'Double', academicYear: '2024-25', semester: 'Sem 1', reason: 'Far from home, need hostel accommodation', status: 'Pending', appliedDate: '2024-07-15', createdAt: '2024-07-15T00:00:00Z', updatedAt: '2024-07-15T00:00:00Z' },
  { id: 'a2', studentId: 's11', studentName: 'Rohit Malhotra', course: 'B.Tech Information Technology', year: '1st Year', preferredHostelId: 'h1', preferredHostel: 'Boys Hostel A', preferredRoomType: 'Single', academicYear: '2024-25', semester: 'Sem 1', reason: 'Need quiet environment for studies', status: 'Waitlisted', appliedDate: '2024-07-14', createdAt: '2024-07-14T00:00:00Z', updatedAt: '2024-07-14T00:00:00Z' },
  { id: 'a3', studentId: 's12', studentName: 'Anjali Mehta', course: 'B.Tech Computer Science', year: '2nd Year', preferredHostelId: 'h2', preferredHostel: 'Girls Hostel B', preferredRoomType: 'Double', academicYear: '2024-25', semester: 'Sem 3', reason: 'Current accommodation too far', specialRequirements: 'Near library wing', status: 'Approved', appliedDate: '2024-07-10', reviewedBy: 'Admin User', reviewedDate: '2024-07-12', reviewRemarks: 'Approved as per eligibility', createdAt: '2024-07-10T00:00:00Z', updatedAt: '2024-07-12T00:00:00Z' },
  { id: 'a4', studentId: 's13', studentName: 'Kavita Singh', course: 'B.Tech Biotechnology', year: '1st Year', preferredHostelId: 'h2', preferredHostel: 'Girls Hostel B', preferredRoomType: 'Single', academicYear: '2024-25', semester: 'Sem 1', reason: 'Hostel required for first year', status: 'Rejected', appliedDate: '2024-07-08', reviewedBy: 'Admin User', reviewedDate: '2024-07-09', reviewRemarks: 'No single rooms available for current academic year', createdAt: '2024-07-08T00:00:00Z', updatedAt: '2024-07-09T00:00:00Z' },
  { id: 'a5', studentId: 's9', studentName: 'Neha Gupta', course: 'B.Tech Biotechnology', year: '1st Year', preferredHostelId: 'h2', preferredHostel: 'Girls Hostel B', preferredRoomType: 'Double', academicYear: '2024-25', semester: 'Sem 1', reason: 'Parent request for hostel stay', medicalRequirements: 'Allergic to dust, requires clean environment', status: 'Pending', appliedDate: '2024-07-20', createdAt: '2024-07-20T00:00:00Z', updatedAt: '2024-07-20T00:00:00Z' },
];

export const INITIAL_ALLOCATIONS: RoomAllocation[] = [
  { id: 'al1', studentId: 's1', studentName: 'Rahul Kumar', hostelId: 'h1', hostelName: 'Boys Hostel A', roomId: 'r1', roomNo: 'A-101', bedId: 'bed1', bedNo: 'A-101-1', buildingId: 'b1', dateAllocated: '2024-06-01', expectedVacateDate: '2025-05-31', status: 'Active', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'al2', studentId: 's8', studentName: 'Priya Sharma', hostelId: 'h2', hostelName: 'Girls Hostel B', roomId: 'r6', roomNo: 'C-101', bedId: 'bed13', bedNo: 'C-101-1', buildingId: 'b3', dateAllocated: '2024-06-01', expectedVacateDate: '2025-05-31', status: 'Active', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'al3', studentId: 's3', studentName: 'Vikram Patel', hostelId: 'h1', hostelName: 'Boys Hostel A', roomId: 'r2', roomNo: 'A-102', bedId: 'bed3', bedNo: 'A-102-1', buildingId: 'b1', dateAllocated: '2024-06-05', expectedVacateDate: '2025-05-31', status: 'Active', createdAt: '2024-06-05T00:00:00Z', updatedAt: '2024-06-05T00:00:00Z' },
];

export const INITIAL_FEES: Fee[] = [
  { id: 'f1', studentId: 's1', studentName: 'Rahul Kumar', feeType: 'Hostel Fee', amount: 12000, paidAmount: 12000, balance: 0, dueDate: '2024-08-10', status: 'Paid', paidDate: '2024-08-05', paymentMethod: 'UPI', transactionId: 'TXN001', receiptNo: 'RCP-001', allocationId: 'al1', period: '2024-25 Sem 1', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-05T00:00:00Z' },
  { id: 'f2', studentId: 's1', studentName: 'Rahul Kumar', feeType: 'Mess Fee', amount: 3000, paidAmount: 3000, balance: 0, dueDate: '2024-08-10', status: 'Paid', paidDate: '2024-08-05', paymentMethod: 'UPI', transactionId: 'TXN002', receiptNo: 'RCP-002', allocationId: 'al1', period: '2024-25 Sem 1', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-05T00:00:00Z' },
  { id: 'f3', studentId: 's2', studentName: 'Amit Singh', feeType: 'Hostel Fee', amount: 12000, paidAmount: 0, balance: 12000, dueDate: '2024-08-10', status: 'Pending', allocationId: 'al1', period: '2024-25 Sem 1', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'f4', studentId: 's4', studentName: 'Suresh Reddy', feeType: 'Hostel Fee', amount: 6000, paidAmount: 2000, balance: 4000, dueDate: '2024-07-10', status: 'Partial', paidDate: '2024-07-01', paymentMethod: 'Cash', transactionId: 'TXN004', receiptNo: 'RCP-003', allocationId: 'al1', period: '2024-25 Sem 1', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
  { id: 'f5', studentId: 's8', studentName: 'Priya Sharma', feeType: 'Hostel Fee', amount: 15000, paidAmount: 15000, balance: 0, dueDate: '2024-08-10', status: 'Paid', paidDate: '2024-08-01', paymentMethod: 'Debit Card', transactionId: 'TXN005', receiptNo: 'RCP-004', allocationId: 'al2', period: '2024-25 Sem 1', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 'f6', studentId: 's9', studentName: 'Neha Gupta', feeType: 'Hostel Fee', amount: 15000, paidAmount: 0, balance: 15000, dueDate: '2024-08-10', status: 'Pending', allocationId: 'al2', period: '2024-25 Sem 1', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'at1', studentId: 's1', studentName: 'Rahul Kumar', date: '2024-08-01', checkInTime: '21:00', checkOutTime: '07:00', status: 'Present', createdAt: '2024-08-01T21:00:00Z', updatedAt: '2024-08-01T21:00:00Z' },
  { id: 'at2', studentId: 's2', studentName: 'Amit Singh', date: '2024-08-01', checkInTime: '21:05', checkOutTime: '07:00', status: 'Present', createdAt: '2024-08-01T21:05:00Z', updatedAt: '2024-08-01T21:05:00Z' },
  { id: 'at3', studentId: 's3', studentName: 'Vikram Patel', date: '2024-08-01', status: 'Absent', createdAt: '2024-08-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 'at4', studentId: 's1', studentName: 'Rahul Kumar', date: '2024-08-02', checkInTime: '20:50', checkOutTime: '07:00', status: 'Present', createdAt: '2024-08-02T20:50:00Z', updatedAt: '2024-08-02T20:50:00Z' },
  { id: 'at5', studentId: 's4', studentName: 'Suresh Reddy', date: '2024-08-01', checkInTime: '22:15', checkOutTime: '07:00', status: 'Late', createdAt: '2024-08-01T22:15:00Z', updatedAt: '2024-08-01T22:15:00Z' },
  { id: 'at6', studentId: 's5', studentName: 'Deepak Joshi', date: '2024-08-02', checkInTime: '09:00', status: 'Leave', remarks: 'Approved leave - medical appointment', createdAt: '2024-08-02T09:00:00Z', updatedAt: '2024-08-02T09:00:00Z' },
  { id: 'at7', studentId: 's6', studentName: 'Manish Yadav', date: '2024-08-02', checkInTime: '21:10', checkOutTime: '07:00', status: 'Present', createdAt: '2024-08-02T21:10:00Z', updatedAt: '2024-08-02T21:10:00Z' },
  { id: 'at8', studentId: 's7', studentName: 'Ravi Shankar', date: '2024-08-02', status: 'Absent', createdAt: '2024-08-02T00:00:00Z', updatedAt: '2024-08-02T00:00:00Z' },
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'l1', studentId: 's1', studentName: 'Rahul Kumar', leaveType: 'Family', reason: 'Family function at home', fromDate: '2024-08-15', toDate: '2024-08-18', status: 'Pending', createdAt: '2024-08-10T00:00:00Z', updatedAt: '2024-08-10T00:00:00Z' },
  { id: 'l2', studentId: 's3', studentName: 'Vikram Patel', leaveType: 'Medical', reason: 'Medical appointment - routine checkup', fromDate: '2024-08-12', toDate: '2024-08-13', status: 'Approved', approvedBy: 'Mr. Sharma', reviewedDate: '2024-08-11', remarks: 'Approved as per medical certificate', createdAt: '2024-08-09T00:00:00Z', updatedAt: '2024-08-11T00:00:00Z' },
  { id: 'l3', studentId: 's5', studentName: 'Deepak Joshi', leaveType: 'Personal', reason: 'Personal work - family matter', fromDate: '2024-08-20', toDate: '2024-08-22', status: 'Rejected', approvedBy: 'Mr. Sharma', reviewedDate: '2024-08-19', remarks: 'Insufficient documentation provided. Parent approval not received.', createdAt: '2024-08-08T00:00:00Z', updatedAt: '2024-08-19T00:00:00Z' },
  { id: 'l4', studentId: 's2', studentName: 'Amit Singh', leaveType: 'Emergency', reason: 'Urgent family emergency', fromDate: '2024-08-14', toDate: '2024-08-16', status: 'Approved', approvedBy: 'Mr. Sharma', reviewedDate: '2024-08-14', remarks: 'Emergency leave approved', createdAt: '2024-08-14T00:00:00Z', updatedAt: '2024-08-14T00:00:00Z' },
  { id: 'l5', studentId: 's4', studentName: 'Suresh Reddy', leaveType: 'Medical', reason: 'Sick leave - viral fever', fromDate: '2024-08-22', toDate: '2024-08-24', status: 'Pending', createdAt: '2024-08-21T00:00:00Z', updatedAt: '2024-08-21T00:00:00Z' },
  { id: 'l6', studentId: 's6', studentName: 'Manish Yadav', leaveType: 'Personal', reason: 'Sister wedding', fromDate: '2024-09-01', toDate: '2024-09-05', status: 'Cancelled', createdAt: '2024-08-25T00:00:00Z', updatedAt: '2024-08-28T00:00:00Z' },
];

export const INITIAL_VISITORS: Visitor[] = [
  { id: 'v1', visitorName: 'Rajesh Kumar', phone: '9876543210', idProofType: 'Aadhar', idProofNo: '1234-5678-9012', studentId: 's1', studentName: 'Rahul Kumar', relation: 'Father', date: '2024-08-05', checkInTime: '10:30', checkOutTime: '14:00', status: 'Checked Out', purpose: 'Family visit', approvedBy: 'Mr. Sharma', createdAt: '2024-08-05T10:00:00Z', updatedAt: '2024-08-05T14:00:00Z' },
  { id: 'v2', visitorName: 'Neelam Sharma', phone: '9876543222', idProofType: 'Aadhar', idProofNo: '9876-5432-1098', studentId: 's8', studentName: 'Priya Sharma', relation: 'Mother', date: '2024-08-10', checkInTime: '11:00', status: 'Checked In', purpose: 'Visit daughter', approvedBy: 'Mr. Sharma', createdAt: '2024-08-10T10:30:00Z', updatedAt: '2024-08-10T11:00:00Z' },
  { id: 'v3', visitorName: 'Rohit Verma', phone: '9876543233', idProofType: 'Driving License', idProofNo: 'DL-2024-56789', studentId: 's3', studentName: 'Vikram Patel', relation: 'Brother', date: '2024-08-10', checkInTime: '15:00', status: 'Pending', purpose: 'Weekend visit', createdAt: '2024-08-09T00:00:00Z', updatedAt: '2024-08-09T00:00:00Z' },
  { id: 'v4', visitorName: 'Anita Gupta', phone: '9876543344', idProofType: 'Passport', idProofNo: 'P-1234567', studentId: 's2', studentName: 'Amit Singh', relation: 'Sister', date: '2024-08-12', status: 'Approved', purpose: 'Birthday celebration', approvedBy: 'Mr. Sharma', createdAt: '2024-08-11T00:00:00Z', updatedAt: '2024-08-12T09:00:00Z' },
  { id: 'v5', visitorName: 'Vikram Joshi', phone: '9876543455', idProofType: 'Aadhar', idProofNo: '4567-8901-2345', studentId: 's5', studentName: 'Deepak Joshi', relation: 'Cousin', date: '2024-08-08', status: 'Rejected', purpose: 'Casual visit', approvedBy: 'Mr. Sharma', remarks: 'No prior appointment. Student not available.', createdAt: '2024-08-07T00:00:00Z', updatedAt: '2024-08-08T10:00:00Z' },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'c1', studentId: 's1', studentName: 'Rahul Kumar', title: 'Fan not working', description: 'Ceiling fan in room A-101 is not working since yesterday', category: 'Electrical', roomId: 'r1', roomNo: 'A-101', priority: 'High', status: 'Open', dateAdded: '2024-08-08', createdAt: '2024-08-08T00:00:00Z', updatedAt: '2024-08-08T00:00:00Z' },
  { id: 'c2', studentId: 's4', studentName: 'Suresh Reddy', title: 'Water leakage in bathroom', description: 'Water leaking from bathroom pipe', category: 'Plumbing', roomId: 'r4', roomNo: 'B-201', priority: 'Critical', status: 'Open', assignedTo: 'u3', assignedToName: 'Raj Kumar', dateAdded: '2024-08-07', createdAt: '2024-08-07T00:00:00Z', updatedAt: '2024-08-07T00:00:00Z' },
  { id: 'c3', studentId: 's3', studentName: 'Vikram Patel', title: 'WiFi not connecting', description: 'WiFi router in A-102 not working', category: 'Internet', roomId: 'r2', roomNo: 'A-102', priority: 'Medium', status: 'In Progress', assignedTo: 'u3', assignedToName: 'Raj Kumar', dateAdded: '2024-08-06', createdAt: '2024-08-06T00:00:00Z', updatedAt: '2024-08-06T00:00:00Z' },
  { id: 'c4', studentId: 's8', studentName: 'Priya Sharma', title: 'Broken chair', description: 'Study chair is broken', category: 'Furniture', roomId: 'r6', roomNo: 'C-101', priority: 'Low', status: 'Resolved', assignedTo: 'u3', assignedToName: 'Raj Kumar', dateAdded: '2024-08-05', resolvedDate: '2024-08-06', resolutionNotes: 'Chair replaced with new one', createdAt: '2024-08-05T00:00:00Z', updatedAt: '2024-08-06T00:00:00Z' },
  { id: 'c5', studentId: 's2', studentName: 'Amit Singh', title: 'Room not cleaned', description: 'Room has not been cleaned for 3 days', category: 'Cleaning', roomId: 'r1', roomNo: 'A-101', priority: 'Medium', status: 'Closed', assignedTo: 'u3', assignedToName: 'Raj Kumar', dateAdded: '2024-08-04', resolvedDate: '2024-08-05', resolutionNotes: 'Room cleaned and sanitized. Staff reminded to maintain schedule.', createdAt: '2024-08-04T00:00:00Z', updatedAt: '2024-08-05T00:00:00Z' },
];

export const INITIAL_MESS_MENU: MessMenu[] = [
  { id: 'm1', day: 'Monday', breakfast: 'Poha, Tea, Banana', lunch: 'Dal, Rice, Roti, Salad', snacks: 'Samosa, Tea', dinner: 'Paneer, Roti, Rice, Halwa', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'm2', day: 'Tuesday', breakfast: 'Aloo Paratha, Curd, Tea', lunch: 'Chole, Rice, Roti, Pickle', snacks: 'Fruit, Tea', dinner: 'Dal Tadka, Roti, Rice, Ice Cream', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'm3', day: 'Wednesday', breakfast: 'Bread Omelette, Tea', lunch: 'Kadhai Chicken, Roti, Rice', snacks: 'Biscuits, Tea', dinner: 'Mix Veg, Roti, Rice, Papad', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'm4', day: 'Thursday', breakfast: 'Idli, Sambhar, Chutney', lunch: 'Rajma, Rice, Roti, Salad', snacks: 'Veg Puff, Tea', dinner: 'Dal, Roti, Rice, Gulab Jamun', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'm5', day: 'Friday', breakfast: 'Puri Bhaji, Tea', lunch: 'Fish Curry, Rice, Roti', snacks: 'Pakora, Tea', dinner: 'Special Biryani, Raita, Salad', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'm6', day: 'Saturday', breakfast: 'Chole Bhature, Tea', lunch: 'Soya Chap, Roti, Rice', snacks: 'Spring Roll, Tea', dinner: 'Kheer, Puri, Aloo Sabzi', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'm7', day: 'Sunday', breakfast: 'Pancake, Juice, Tea', lunch: 'Veg Thali (Special)', snacks: 'Cake, Tea', dinner: 'Chicken Curry, Roti, Rice', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

export const INITIAL_MEAL_REQUESTS: MealRequest[] = [
  { id: 'rq1', studentId: 's1', studentName: 'Rahul Kumar', date: '2024-08-15', mealType: 'Lunch', items: 'Jain Thali - No onion/garlic', reason: 'Religious fasting', status: 'Pending', createdAt: '2024-08-14T10:00:00Z', updatedAt: '2024-08-14T10:00:00Z' },
  { id: 'rq2', studentId: 's2', studentName: 'Amit Singh', date: '2024-08-16', mealType: 'Dinner', items: 'Egg Curry instead of Paneer', reason: 'High protein diet', status: 'Approved', dietaryPreference: 'High Protein', createdAt: '2024-08-15T09:00:00Z', updatedAt: '2024-08-15T14:00:00Z' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Single Bed', category: 'Furniture', sku: 'FURN-SB-001', quantity: 120, availableQuantity: 118, unit: 'Piece', condition: 'Good', location: 'Boys Hostel A', status: 'Available', purchaseDate: '2024-01-15', vendor: 'Furniture World', cost: 8500, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
  { id: 'i2', name: 'Study Table', category: 'Furniture', sku: 'FURN-ST-002', quantity: 100, availableQuantity: 97, unit: 'Piece', condition: 'Good', location: 'Boys Hostel A', status: 'Available', purchaseDate: '2024-01-15', vendor: 'Furniture World', cost: 4500, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
  { id: 'i3', name: 'Ceiling Fan', category: 'Electrical', sku: 'ELEC-CF-003', quantity: 80, availableQuantity: 78, unit: 'Piece', condition: 'Good', location: 'Boys Hostel A', status: 'Available', purchaseDate: '2024-02-01', vendor: 'ElectroShop', cost: 1800, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-05-20T00:00:00Z' },
  { id: 'i4', name: 'Water Cooler', category: 'Other', sku: 'OTHER-WC-004', quantity: 5, availableQuantity: 5, unit: 'Piece', condition: 'Damaged', location: 'Boys Hostel A', status: 'Low Stock', purchaseDate: '2023-06-01', vendor: 'Cooling Solutions', cost: 15000, createdAt: '2023-06-01T00:00:00Z', updatedAt: '2024-04-10T00:00:00Z', notes: '2 units not working' },
  { id: 'i5', name: 'Double Bed', category: 'Furniture', sku: 'FURN-DB-005', quantity: 60, availableQuantity: 60, unit: 'Piece', condition: 'New', location: 'Girls Hostel B', status: 'Available', purchaseDate: '2024-07-01', vendor: 'Furniture World', cost: 12000, createdAt: '2024-07-01T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
  { id: 'i6', name: 'Mattress', category: 'Furniture', sku: 'FURN-MT-006', quantity: 200, availableQuantity: 195, unit: 'Piece', condition: 'Good', location: 'All Hostels', status: 'Available', purchaseDate: '2024-01-15', vendor: 'SleepWell Co', cost: 2500, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'i7', name: 'Chair', category: 'Furniture', sku: 'FURN-CH-007', quantity: 150, availableQuantity: 148, unit: 'Piece', condition: 'Damaged', location: 'Boys Hostel A', status: 'Available', purchaseDate: '2024-03-15', vendor: 'Furniture World', cost: 2200, createdAt: '2024-03-15T00:00:00Z', updatedAt: '2024-03-15T00:00:00Z', notes: 'Many need replacement' },
  { id: 'i8', name: 'Cleaning Detergent', category: 'Cleaning', sku: 'CLN-CD-008', quantity: 50, availableQuantity: 3, unit: 'Liter', condition: 'Good', location: 'Store Room A', status: 'Low Stock', purchaseDate: '2024-08-01', vendor: 'CleanPro', cost: 350, createdAt: '2024-08-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
  { id: 'i9', name: 'Notebook', category: 'Stationery', sku: 'STAT-NB-009', quantity: 0, availableQuantity: 0, unit: 'Piece', condition: 'New', location: 'Store Room A', status: 'Out of Stock', purchaseDate: '2024-07-01', vendor: 'Stationery Mart', cost: 50, createdAt: '2024-07-01T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z' },
];

export const INITIAL_STUDENT_DOCUMENTS: StudentDocument[] = [
  { id: 'doc1', studentId: 's1', studentName: 'Rahul Kumar', fileName: 'aadhaar_rahul.pdf', type: 'Aadhaar', status: 'Verified', fileUrl: '/files/aadhaar_rahul.pdf', uploadedAt: '2024-06-01T10:00:00Z', verifiedAt: '2024-06-02T14:00:00Z', verifiedBy: 'Admin User', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-02T14:00:00Z' },
  { id: 'doc2', studentId: 's1', studentName: 'Rahul Kumar', fileName: 'admission_letter_rahul.pdf', type: 'Admission Letter', status: 'Verified', fileUrl: '/files/admission_rahul.pdf', uploadedAt: '2024-06-01T10:00:00Z', verifiedAt: '2024-06-02T14:00:00Z', verifiedBy: 'Admin User', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-02T14:00:00Z' },
  { id: 'doc3', studentId: 's2', studentName: 'Amit Singh', fileName: 'pan_amit.pdf', type: 'PAN', status: 'Pending', fileUrl: '', uploadedAt: '2024-08-10T09:00:00Z', createdAt: '2024-08-10T09:00:00Z', updatedAt: '2024-08-10T09:00:00Z' },
  { id: 'doc4', studentId: 's2', studentName: 'Amit Singh', fileName: 'fee_receipt_amit.pdf', type: 'Fee Receipt', status: 'Verified', fileUrl: '/files/fee_receipt_amit.pdf', uploadedAt: '2024-07-15T11:00:00Z', verifiedAt: '2024-07-16T10:00:00Z', verifiedBy: 'Admin User', createdAt: '2024-07-15T11:00:00Z', updatedAt: '2024-07-16T10:00:00Z' },
  { id: 'doc5', studentId: 's3', studentName: 'Vikram Patel', fileName: 'medical_vikram.pdf', type: 'Medical Certificate', status: 'Rejected', fileUrl: '/files/medical_vikram.pdf', uploadedAt: '2024-08-05T08:00:00Z', verifiedAt: '2024-08-06T09:00:00Z', verifiedBy: 'Admin User', remarks: 'Document is illegible. Please upload a clearer copy.', createdAt: '2024-08-05T08:00:00Z', updatedAt: '2024-08-06T09:00:00Z' },
  { id: 'doc6', studentId: 's4', studentName: 'Priya Sharma', fileName: 'passport_priya.pdf', type: 'Passport', status: 'Pending', fileUrl: '', uploadedAt: '2024-08-12T15:00:00Z', createdAt: '2024-08-12T15:00:00Z', updatedAt: '2024-08-12T15:00:00Z' },
];

export const INITIAL_NOTIFICATION_MESSAGES: NotificationMessage[] = [
  { id: 'nm1', title: 'Fee Due Reminder', message: 'Hostel fee payment deadline approaching for all students.', type: 'Warning', target: 'All', deliveryChannel: 'In-App', status: 'Sent', sentTime: '2024-08-01T08:00:00Z', read: false, createdBy: 'Admin User', createdAt: '2024-08-01T07:00:00Z', updatedAt: '2024-08-01T08:00:00Z' },
  { id: 'nm2', title: 'Maintenance Notice', message: 'Water supply will be shut on Aug 12 from 10 AM to 4 PM.', type: 'Info', target: 'All', deliveryChannel: 'In-App', status: 'Sent', sentTime: '2024-08-09T09:00:00Z', read: true, readAt: '2024-08-09T12:00:00Z', readBy: 's1', createdBy: 'Admin User', createdAt: '2024-08-09T08:00:00Z', updatedAt: '2024-08-09T09:00:00Z' },
  { id: 'nm3', title: 'Leave Approved', message: 'Your leave request has been approved by the warden.', type: 'Success', target: 'Student', recipientId: 's1', deliveryChannel: 'In-App', status: 'Sent', sentTime: '2024-08-10T14:00:00Z', read: false, createdBy: 'Warden', createdAt: '2024-08-10T13:00:00Z', updatedAt: '2024-08-10T14:00:00Z' },
  { id: 'nm4', title: 'System Maintenance', message: 'Scheduled maintenance on Aug 15, 2-4 AM. System may be unavailable.', type: 'Warning', target: 'All', deliveryChannel: 'In-App', status: 'Scheduled', scheduledTime: '2024-08-14T23:00:00Z', read: false, createdBy: 'Admin User', createdAt: '2024-08-10T10:00:00Z', updatedAt: '2024-08-10T10:00:00Z' },
  { id: 'nm5', title: 'Welcome New Students', message: 'Welcome to the hostel! Please complete your profile.', type: 'Info', target: 'Student', deliveryChannel: 'In-App', status: 'Draft', read: false, createdBy: 'Admin User', createdAt: '2024-08-11T09:00:00Z', updatedAt: '2024-08-11T09:00:00Z' },
  { id: 'nm6', title: 'Emergency Alert', message: 'Fire drill scheduled for tomorrow at 10 AM.', type: 'Error', target: 'All', deliveryChannel: 'In-App', status: 'Failed', read: false, createdBy: 'Admin User', createdAt: '2024-08-12T08:00:00Z', updatedAt: '2024-08-12T08:00:00Z' },
];

export const INITIAL_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: 'nt1', name: 'Fee Reminder', title: 'Fee Due Reminder', message: 'Your hostel fee of {amount} is due by {date}. Please pay immediately.', type: 'Warning', target: 'Student', deliveryChannel: 'In-App', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'nt2', name: 'Maintenance Alert', title: 'Maintenance Notice', message: 'Scheduled maintenance on {date} from {time}. Affected areas: {areas}.', type: 'Info', target: 'All', deliveryChannel: 'In-App', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u4', title: 'Fee Due Reminder', message: 'Your hostel fee of 12,000 is due on Aug 10, 2024.', type: 'Fee Due', read: false, date: '2024-08-08' },
  { id: 'n2', userId: 'u1', title: 'New Complaint', message: 'New complaint raised by Rahul Kumar in Room A-101.', type: 'General', read: false, date: '2024-08-08' },
  { id: 'n3', userId: 'u2', title: 'Leave Request', message: 'Rahul Kumar has requested leave from Aug 15-18.', type: 'General', read: false, date: '2024-08-10' },
  { id: 'n4', userId: 'u1', title: 'Complaint Resolved', message: 'Broken chair complaint by Priya Sharma has been resolved.', type: 'Complaint Resolved', read: true, date: '2024-08-06' },
  { id: 'n5', userId: 'u4', title: 'Mess Menu Updated', message: 'Check out this week\'s special menu!', type: 'Mess Menu', read: true, date: '2024-08-05' },
];

export const INITIAL_EMERGENCY_ALERTS: EmergencyAlert[] = [
  { id: 'e1', type: 'Medical', location: 'Boys Hostel A, Room B-201', description: 'Student feeling severe chest pain', reportedBy: 'Suresh Reddy', reportedAt: '2024-08-07 11:30 PM', status: 'Resolved', notifiedTo: ['Warden', 'Parents', 'Campus Security'] },
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'st1', name: 'Raj Kumar', role: 'Maintenance Staff', phone: '9876543301', email: 'raj@hostelflow.com', department: 'Electrical', joinDate: '2023-01-15', status: 'Active' },
  { id: 'st2', name: 'Amit Verma', role: 'Plumber', phone: '9876543302', email: 'amit@hostelflow.com', department: 'Plumbing', joinDate: '2023-03-20', status: 'Active' },
  { id: 'st3', name: 'Suresh Yadav', role: 'Carpenter', phone: '9876543303', email: 'suresh@hostelflow.com', department: 'Carpentry', joinDate: '2022-11-01', status: 'Active' },
  { id: 'st4', name: 'Mohan Singh', role: 'Cleaner', phone: '9876543304', email: 'mohan@hostelflow.com', department: 'Cleaning', joinDate: '2024-01-10', status: 'Active' },
  { id: 'st5', name: 'Ravi Kumar', role: 'Security Guard', phone: '9876543305', email: 'ravi@hostelflow.com', department: 'Security', joinDate: '2023-06-01', status: 'Active' },
];

export const INITIAL_NOTICES: Notice[] = [
  { id: 'no1', title: 'Hostel Inauguration', content: 'The new wing of Boys Hostel A will be inaugurated on Aug 15th by the Dean.', date: '2024-08-10', category: 'Event', author: 'Admin' },
  { id: 'no2', title: 'Maintenance Schedule', content: 'Water supply will be shut down on Aug 12th from 10 AM to 4 PM for tank cleaning.', date: '2024-08-09', category: 'Notice', author: 'Warden' },
  { id: 'no3', title: 'Annual Sports Meet', content: 'Hostel Annual Sports Meet registration open until Aug 20th. Contact your warden.', date: '2024-08-08', category: 'Event', author: 'Admin' },
  { id: 'no4', title: 'Mess Fee Revision', content: 'Mess fee for the upcoming semester has been revised to 3,500/month.', date: '2024-08-05', category: 'Notice', author: 'Admin' },
];

export const INITIAL_INSTITUTE_SETTINGS: InstituteSettings = {
  id: 'is1',
  name: 'HostelFlow Institute',
  address: '123 Campus Drive, University Road',
  phone: '+1-555-0100',
  email: 'info@hostelflow.com',
  website: 'https://hostelflow.com',
  logo: '',
  academicYear: '2024-2025',
  currentSemester: 'Fall 2024',
};

export const INITIAL_HOSTEL_SETTINGS: HostelSettings = {
  id: 'hs1',
  hostelId: 'h1',
  checkInTime: '21:00',
  checkOutTime: '10:00',
  lateFeePerDay: 50,
  messFeePerMonth: 3500,
  allowOvernight: true,
  visitorAllowed: true,
  parentApprovalRequired: true,
};

export const INITIAL_SMTP_CONFIG: SMTPConfig = {
  host: 'smtp.hostelflow.com',
  port: 587,
  user: 'noreply@hostelflow.com',
  pass: '',
  fromEmail: 'noreply@hostelflow.com',
};

export const INITIAL_CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: 'hostelflow',
  apiKey: '',
  uploadPreset: 'hostelflow_uploads',
};

export const INITIAL_RAZORPAY_CONFIG: RazorpayConfig = {
  keyId: '',
  keySecret: '',
};

export const INITIAL_SYSTEM_PREFERENCES: SystemPreferences = {
  id: 'sp1',
  theme: 'light',
  language: 'en',
  timezone: 'Asia/Kolkata',
  attendanceCutoffTime: '09:00',
  feeDueReminderDays: 7,
  notificationPreferences: {
    feeDueReminders: true,
    leaveRequestAlerts: true,
    complaintUpdates: true,
    messMenuUpdates: true,
    emergencyAlerts: true,
  },
};

export const INITIAL_ROLES: Role[] = [
  { id: 'role1', name: 'Admin', description: 'Full system access', permissions: ['all'], isDefault: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role2', name: 'Warden', description: 'Hostel management access', permissions: ['hostel:read', 'hostel:write', 'student:read', 'student:write', 'attendance:read', 'attendance:write', 'fee:read', 'fee:write', 'complaint:read', 'complaint:write', 'leave:read', 'leave:write'], isDefault: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role3', name: 'Staff', description: 'Limited operational access', permissions: ['attendance:read', 'attendance:write', 'complaint:read', 'complaint:write', 'visitor:read', 'visitor:write'], isDefault: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role4', name: 'Student', description: 'Self-service access', permissions: ['profile:read', 'profile:write', 'fee:read', 'attendance:read', 'complaint:write', 'leave:write'], isDefault: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'al1', action: 'Updated', entityType: 'InstituteSettings', entityId: 'is1', field: 'name', oldValue: 'Old Institute', newValue: 'HostelFlow Institute', performedBy: 'Admin User', timestamp: '2024-08-01T10:00:00Z', details: 'Updated institute name' },
  { id: 'al2', action: 'Updated', entityType: 'HostelSettings', entityId: 'hs1', field: 'checkInTime', oldValue: '20:00', newValue: '21:00', performedBy: 'Admin User', timestamp: '2024-08-02T11:30:00Z', details: 'Changed check-in time' },
  { id: 'al3', action: 'Created', entityType: 'Role', entityId: 'role5', field: '', oldValue: '', newValue: 'Security', performedBy: 'Admin User', timestamp: '2024-08-03T09:15:00Z', details: 'Created new role: Security' },
  { id: 'al4', action: 'Updated', entityType: 'SystemPreferences', entityId: 'sp1', field: 'theme', oldValue: 'light', newValue: 'dark', performedBy: 'Admin User', timestamp: '2024-08-04T14:00:00Z', details: 'Changed theme to dark' },
  { id: 'al5', action: 'Deleted', entityType: 'Role', entityId: 'role6', field: '', oldValue: 'Maintenance', newValue: '', performedBy: 'Admin User', timestamp: '2024-08-05T16:45:00Z', details: 'Deleted role: Maintenance' },
];

export const INITIAL_BACKUP_RECORDS: BackupRecord[] = [
  { id: 'br1', fileName: 'backup_2024_08_01.sql', fileSize: '256 MB', status: 'Completed', createdAt: '2024-08-01T02:00:00Z', performedBy: 'System', notes: 'Automated weekly backup' },
  { id: 'br2', fileName: 'backup_2024_07_25.sql', fileSize: '250 MB', status: 'Completed', createdAt: '2024-07-25T02:00:00Z', performedBy: 'System', notes: 'Automated weekly backup' },
  { id: 'br3', fileName: 'backup_2024_07_18.sql', fileSize: '248 MB', status: 'Failed', createdAt: '2024-07-18T02:05:00Z', performedBy: 'System', notes: 'Disk full error' },
];
