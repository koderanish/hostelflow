// TEMP mock data — swap these for real API calls (see src/api/client.ts)
// once Member 1's backend endpoints are live. Keeping shapes close to the
// likely Mongoose schemas makes that swap mostly a find-and-replace later.

export const mockStudent = {
  name: "Alex Henderson",
  studentId: "HF-2024-8892",
  course: "B.Tech Computer Science",
  year: "Year 3, Semester 2",
  phone: "+1 (555) 012-3456",
  email: "a.henderson@university.edu",
  guardian: "Sarah Henderson (Mother)",
  roomNumber: "Block C - 402",
  validUntil: "June 2025",
  avatar: "https://i.pravatar.cc/150?img=12",
};

export const mockDashboard = {
  roomNumber: "B-204",
  attendancePercent: 94,
  nextPayment: { amount: 450.0, dueInDays: 5 },
  announcements: [
    {
      id: "1",
      icon: "build",
      title: "Maintenance in Block B",
      body: "Water supply will be suspended this Sunday from 10 AM to 2 PM for routine tank cleaning.",
      time: "2 hours ago",
    },
  ],
  schedule: [
    { id: "1", day: "24", month: "OCT", title: "Mess Committee Meeting", meta: "6:30 PM • Dining Hall" },
    { id: "2", day: "26", month: "OCT", title: "Hostel Cultural Night", meta: "8:00 PM • Main Lawn" },
  ],
};

export const mockRoom = {
  roomNumber: "Room 402",
  type: "Premium Double",
  wing: "Block A - North Wing",
  floor: "4th Floor, Skyline Residency",
  image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  serviceStatus: "All systems operational",
  roommate: {
    name: "Alex Thompson",
    detail: "B.Tech CS • Year 3",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  facilities: [
    { icon: "wifi", label: "High-speed WiFi" },
    { icon: "ac-unit", label: "AC Control" },
    { icon: "shower", label: "Private Bath" },
    { icon: "desk", label: "Study Desks" },
    { icon: "kitchen", label: "Mini Fridge" },
    { icon: "cleaning-services", label: "Weekly Service" },
  ],
  maintenanceHistory: [
    { id: "1", issue: "AC Filter Cleaning", date: "Oct 12, 2023", status: "Completed", resolution: "Filter replaced by site team" },
    { id: "2", issue: "Leaking Faucet", date: "Aug 05, 2023", status: "Completed", resolution: "Washer replaced in bathroom" },
    { id: "3", issue: "WiFi Connectivity", date: "Jul 20, 2023", status: "Archived", resolution: "Router reset remotely" },
  ],
};

export const mockPayments = {
  outstandingBalance: 1240.5,
  dueDate: "Oct 15, 2023",
  invoices: [
    { id: "1", icon: "bed", label: "Hostel Rent", amount: 850.0, meta: "Shared Deluxe - Room 402" },
    { id: "2", icon: "bolt", label: "Electricity", amount: 140.5, meta: "Meter #882910 (320 kWh)" },
    { id: "3", icon: "restaurant", label: "Mess Fees", amount: 250.0, meta: "Full Meal Plan - Sept 2023" },
  ],
  history: [
    { id: "1", ref: "INV-2023-08", meta: "August 2023 Billing", date: "Aug 02, 2023", amount: 1150.0, status: "Paid" },
    { id: "2", ref: "INV-2023-07", meta: "July 2023 Billing", date: "Jul 04, 2023", amount: 1150.0, status: "Paid" },
    { id: "3", ref: "INV-2023-06", meta: "June 2023 Billing", date: "Jun 03, 2023", amount: 1210.2, status: "Paid" },
  ],
  scheduled: [
    { id: "1", date: "Oct 01, 2023", label: "Next Rent Due", amount: 850.0, status: "Pending" },
    { id: "2", date: "Oct 05, 2023", label: "Mess Advance", amount: 250.0, status: "Pending" },
  ],
};
