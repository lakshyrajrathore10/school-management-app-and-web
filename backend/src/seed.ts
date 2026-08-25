import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './config/db';
import {
  School,
  User,
  LeaveQuota,
  Attendance,
  Leave,
  Holiday,
  Notification,
  AuditLog,
  RefreshToken,
} from './models';
import {
  Role,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  HolidayType,
  NotificationType,
} from './types/enums';

async function seed() {
  console.log('🌱 Starting database seed...');
  await connectDB();

  // 1. Clean existing records
  await AuditLog.deleteMany({});
  await Notification.deleteMany({});
  await Holiday.deleteMany({});
  await LeaveQuota.deleteMany({});
  await Leave.deleteMany({});
  await Attendance.deleteMany({});
  await RefreshToken.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});

  // 2. Create Default School
  const school = await School.create({
    name: 'Whiteleaf International School',
    code: 'SCH-WHITELEAF-01',
    latitude: 22.719568,
    longitude: 75.857727,
    allowedRadiusMeters: 200,
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    graceMinutes: 15,
    timezone: 'Asia/Kolkata',
  });

  console.log(`✅ School created: ${school.name} (${school.id})`);

  // 3. Create Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const staffUser = await User.create({
    employeeId: 'EMP001',
    email: 'staff@whiteleaf.edu',
    passwordHash,
    name: 'Whiteleaf Staff',
    phone: '+91 98765 43210',
    designation: 'Senior Teacher',
    department: 'Academics',
    role: Role.STAFF,
    schoolId: school._id,
  });

  const staffUser2 = await User.create({
    employeeId: 'EMP002',
    email: 'rahul@whiteleaf.edu',
    passwordHash,
    name: 'Rahul Sharma',
    phone: '+91 98123 45678',
    designation: 'Mathematics Lecturer',
    department: 'Academics',
    role: Role.STAFF,
    schoolId: school._id,
  });

  const adminUser = await User.create({
    employeeId: 'ADMIN001',
    email: 'admin@whiteleaf.edu',
    passwordHash,
    name: 'School Principal',
    phone: '+91 99999 88888',
    designation: 'Principal',
    department: 'Administration',
    role: Role.ADMIN,
    schoolId: school._id,
  });

  console.log(`✅ Test users created: EMP001, EMP002, ADMIN001`);

  // 4. Create Leave Quotas for EMP001
  const currentYear = 2026;
  await LeaveQuota.insertMany([
    { userId: staffUser._id, year: currentYear, leaveType: LeaveType.CASUAL, totalAllowed: 12, used: 2, remaining: 10 },
    { userId: staffUser._id, year: currentYear, leaveType: LeaveType.SICK, totalAllowed: 10, used: 1, remaining: 9 },
    { userId: staffUser._id, year: currentYear, leaveType: LeaveType.EARNED, totalAllowed: 15, used: 3, remaining: 12 },
    { userId: staffUser._id, year: currentYear, leaveType: LeaveType.PAID, totalAllowed: 12, used: 1, remaining: 11 },
  ]);

  // 5. Create Sample Attendance History
  const historyData = [
    { date: '2026-08-07', in: '08:48:00', out: '16:30:00', status: AttendanceStatus.PRESENT, isLate: false, mins: 462 },
    { date: '2026-08-06', in: '08:52:00', out: '16:32:00', status: AttendanceStatus.PRESENT, isLate: false, mins: 460 },
    { date: '2026-08-05', in: '09:15:00', out: '16:30:00', status: AttendanceStatus.LATE, isLate: true, mins: 435 },
    { date: '2026-08-04', in: '08:45:00', out: '16:30:00', status: AttendanceStatus.PRESENT, isLate: false, mins: 465 },
    { date: '2026-08-03', in: '09:20:00', out: '16:30:00', status: AttendanceStatus.LATE, isLate: true, mins: 430 },
    { date: '2026-08-01', in: '08:50:00', out: '16:35:00', status: AttendanceStatus.PRESENT, isLate: false, mins: 465 },
  ];

  for (const item of historyData) {
    const checkInAt = new Date(`${item.date}T${item.in}`);
    const checkOutAt = new Date(`${item.date}T${item.out}`);

    await Attendance.create({
      userId: staffUser._id,
      schoolId: school._id,
      date: item.date,
      checkInAt,
      checkOutAt,
      workingMinutes: item.mins,
      status: item.status,
      isLate: item.isLate,
      checkInLat: school.latitude,
      checkInLon: school.longitude,
      checkInAccuracy: 12.5,
      checkOutLat: school.latitude,
      checkOutLon: school.longitude,
      checkOutAccuracy: 14.0,
    });
  }

  console.log(`✅ Sample attendance history populated.`);

  // 6. Create Sample Leaves
  await Leave.insertMany([
    {
      userId: staffUser._id,
      leaveType: LeaveType.PAID,
      startDate: '2026-08-02',
      endDate: '2026-08-02',
      totalDays: 1,
      reason: 'Monthly paid leave day',
      status: LeaveStatus.APPROVED,
      reviewedById: adminUser._id,
      reviewComment: 'Approved by Principal',
    },
    {
      userId: staffUser._id,
      leaveType: LeaveType.CASUAL,
      startDate: '2026-08-10',
      endDate: '2026-08-10',
      totalDays: 1,
      reason: 'Personal work',
      status: LeaveStatus.APPROVED,
      reviewedById: adminUser._id,
      reviewComment: 'Approved by Principal',
    },
    {
      userId: staffUser._id,
      leaveType: LeaveType.SICK,
      startDate: '2026-08-15',
      endDate: '2026-08-16',
      totalDays: 2,
      reason: 'Fever and body pain, need rest.',
      status: LeaveStatus.PENDING,
    },
  ]);

  console.log(`✅ Sample leaves populated.`);

  // 7. Create School Holidays
  await Holiday.insertMany([
    {
      schoolId: school._id,
      name: 'Independence Day',
      startDate: '2026-08-15',
      dayName: 'Saturday',
      type: HolidayType.NATIONAL,
      description: 'National Independence Day celebration.',
    },
    {
      schoolId: school._id,
      name: 'Raksha Bandhan',
      startDate: '2026-08-28',
      dayName: 'Friday',
      type: HolidayType.FESTIVAL,
      description: 'Traditional festival holiday.',
    },
    {
      schoolId: school._id,
      name: 'Janmashtami',
      startDate: '2026-09-04',
      dayName: 'Friday',
      type: HolidayType.FESTIVAL,
      description: 'Lord Krishna Jayanti holiday.',
    },
    {
      schoolId: school._id,
      name: 'Mahatma Gandhi Jayanti',
      startDate: '2026-10-02',
      dayName: 'Friday',
      type: HolidayType.NATIONAL,
      description: 'Gandhi Jayanti national holiday.',
    },
    {
      schoolId: school._id,
      name: 'Dussehra',
      startDate: '2026-10-20',
      dayName: 'Tuesday',
      type: HolidayType.FESTIVAL,
      description: 'Dussehra festival holiday.',
    },
    {
      schoolId: school._id,
      name: 'Diwali Break',
      startDate: '2026-11-08',
      endDate: '2026-11-12',
      dayName: 'Sun - Thu',
      type: HolidayType.VACATION,
      description: 'Annual Diwali festival vacation.',
    },
  ]);

  console.log(`✅ School holiday calendar populated.`);

  // 8. Create Notifications
  await Notification.insertMany([
    {
      userId: staffUser._id,
      type: NotificationType.ATTENDANCE_REMINDER,
      title: 'Attendance Reminder',
      body: 'Please mark your attendance before 9:15 AM. Late marking will be flagged.',
      isRead: false,
    },
    {
      userId: staffUser._id,
      type: NotificationType.LEAVE_APPROVAL,
      title: 'Leave Approved',
      body: 'Your Casual Leave application for 10 Aug 2026 has been approved by the Principal.',
      isRead: false,
    },
    {
      userId: staffUser._id,
      type: NotificationType.HOLIDAY_NOTICE,
      title: 'Independence Day Holiday',
      body: 'School will remain closed on 15 August 2026 (Independence Day). No classes.',
      isRead: true,
    },
    {
      userId: staffUser._id,
      type: NotificationType.MEETING_NOTICE,
      title: 'Staff Meeting – 6 Aug',
      body: 'All teaching staff are required to attend the monthly staff meeting at 3:00 PM on 6 Aug 2026 in the Conference Hall.',
      isRead: true,
    },
    {
      userId: staffUser._id,
      type: NotificationType.GENERAL_CIRCULAR,
      title: 'New Academic Calendar Released',
      body: 'The updated academic calendar for session 2026-27 has been published. Please check the school portal.',
      isRead: true,
    },
  ]);

  console.log(`✅ Notifications populated.`);
  console.log('🎉 Database seeding completed successfully!');
  await disconnectDB();
}

seed().catch(err => {
  console.error('❌ Error during database seeding:', err);
  process.exit(1);
});
