const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get student attendance records
 * GET /api/student/attendance
 */
const getAttendance = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;
    const { courseId } = req.query;

    const where = { studentId: profileId };
    if (courseId) where.courseId = courseId;

    const attendance = await prisma.attendance.findMany({
      where,
      include: { course: { select: { name: true, code: true } } },
      orderBy: { date: 'desc' }
    });

    // Calculate attendance percentage per course
    const courseStats = {};
    attendance.forEach(record => {
      const key = record.courseId;
      if (!courseStats[key]) {
        courseStats[key] = { courseName: record.course.name, courseCode: record.course.code, total: 0, present: 0, absent: 0, late: 0 };
      }
      courseStats[key].total++;
      if (record.status === 'PRESENT') courseStats[key].present++;
      else if (record.status === 'ABSENT') courseStats[key].absent++;
      else if (record.status === 'LATE') courseStats[key].late++;
    });

    const summary = Object.values(courseStats).map(stat => ({
      ...stat,
      percentage: stat.total > 0 ? Math.round(((stat.present + stat.late) / stat.total) * 100) : 0
    }));

    res.json({ attendance, summary });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student grades
 * GET /api/student/grades
 */
const getGrades = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;
    const { semester } = req.query;

    const where = { studentId: profileId };
    if (semester) where.semester = semester;

    const grades = await prisma.grade.findMany({
      where,
      include: { course: { select: { name: true, code: true, credits: true } } },
      orderBy: { semester: 'desc' }
    });

    // Calculate GPA
    let totalCredits = 0;
    let totalGradePoints = 0;
    grades.forEach(g => {
      if (g.gpa !== null && g.course.credits) {
        totalCredits += g.course.credits;
        totalGradePoints += g.gpa * g.course.credits;
      }
    });
    const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : null;

    res.json({ grades, cgpa });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available courses for registration
 * GET /api/student/available-courses
 */
const getAvailableCourses = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;

    // Get courses student is not already enrolled in
    const enrolledCourseIds = await prisma.enrollment.findMany({
      where: { studentId: profileId, isActive: true },
      select: { courseId: true }
    });

    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        id: { notIn: enrolledCourseIds.map(e => e.courseId) }
      },
      include: {
        department: true,
        _count: { select: { enrollments: true } }
      }
    });

    res.json({ courses: courses.map(c => ({ ...c, availableSeats: c.maxCapacity - c._count.enrollments })) });
  } catch (error) {
    next(error);
  }
};

/**
 * Register for a course
 * POST /api/student/register-course
 */
const registerCourse = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required.' });
    }

    // Check if course exists and is active
    const course = await prisma.course.findFirst({
      where: { id: courseId, isActive: true },
      include: { _count: { select: { enrollments: true } } }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found or inactive.' });
    }

    // Check capacity
    if (course._count.enrollments >= course.maxCapacity) {
      return res.status(400).json({ error: 'Course is full. No available seats.' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: profileId, courseId } }
    });

    if (existingEnrollment) {
      return res.status(409).json({ error: 'Already enrolled in this course.' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId: profileId, courseId },
      include: { course: true }
    });

    res.status(201).json({ message: 'Successfully registered for course', enrollment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrolled courses
 * GET /api/student/my-courses
 */
const getMyCourses = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: profileId, isActive: true },
      include: { course: { include: { department: true } } }
    });

    res.json({ courses: enrollments.map(e => e.course) });
  } catch (error) {
    next(error);
  }
};

/**
 * Get digital ID card data
 * GET /api/student/digital-id
 */
const getDigitalId = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: { include: { department: true } } }
    });

    const digitalId = {
      studentId: user.profile.studentId,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      email: user.email,
      department: user.profile.department?.name || 'Unassigned',
      departmentCode: user.profile.department?.code || 'N/A',
      avatarUrl: user.profile.avatarUrl,
      dateOfBirth: user.profile.dateOfBirth,
      phone: user.profile.phone,
      validUntil: new Date(new Date().getFullYear() + 1, 5, 30).toISOString() // Valid until June 30 next year
    };

    res.json({ digitalId });
  } catch (error) {
    next(error);
  }
};

/**
 * Get study materials for enrolled courses
 * GET /api/student/materials
 */
const getMaterials = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;
    const { courseId } = req.query;

    // Get enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: profileId, isActive: true },
      select: { courseId: true }
    });

    const where = { courseId: { in: enrollments.map(e => e.courseId) } };
    if (courseId) where.courseId = courseId;

    const materials = await prisma.studyMaterial.findMany({
      where,
      include: { course: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ materials });
  } catch (error) {
    next(error);
  }
};

/**
 * Get fee status
 * GET /api/student/fees
 */
const getFeeStatus = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;

    const fees = await prisma.feeStatus.findMany({
      where: { studentId: profileId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ fees });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard stats
 * GET /api/student/stats
 */
const getStats = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;

    const [enrolledCourses, attendanceRecords, grades, pendingFees] = await Promise.all([
      prisma.enrollment.count({ where: { studentId: profileId, isActive: true } }),
      prisma.attendance.findMany({ where: { studentId: profileId } }),
      prisma.grade.findMany({ where: { studentId: profileId } }),
      prisma.feeStatus.count({ where: { studentId: profileId, status: { in: ['PENDING', 'OVERDUE'] } } })
    ]);

    // Overall attendance percentage
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    // CGPA
    let totalCredits = 0;
    let totalGradePoints = 0;
    // Note: we'd need course credits here, simplified calculation
    const cgpa = grades.length > 0 
      ? (grades.reduce((sum, g) => sum + (g.gpa || 0), 0) / grades.filter(g => g.gpa !== null).length).toFixed(2)
      : null;

    res.json({
      stats: {
        enrolledCourses,
        attendancePercentage,
        cgpa,
        pendingFees,
        totalClasses,
        presentClasses
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance, getGrades, getAvailableCourses,
  registerCourse, getMyCourses, getDigitalId,
  getMaterials, getFeeStatus, getStats
};
