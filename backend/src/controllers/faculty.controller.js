const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get faculty's assigned courses
 * GET /api/faculty/courses
 */
const getMyCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { facultyId: req.user.profile.id },
      include: {
        department: true,
        _count: { select: { enrollments: true } }
      }
    });
    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

/**
 * Get students enrolled in a course
 * GET /api/faculty/courses/:courseId/students
 */
const getCourseStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true, avatarUrl: true } }
      }
    });

    res.json({ students: enrollments.map(e => e.student) });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark attendance for students
 * POST /api/faculty/attendance
 */
const markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Course ID, date, and attendance records are required.' });
    }

    // Verify faculty is assigned to this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, facultyId: req.user.profile.id }
    });

    if (!course) {
      return res.status(403).json({ error: 'You are not assigned to this course.' });
    }

    const attendanceRecords = await Promise.all(
      records.map(record =>
        prisma.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: record.studentId,
              courseId,
              date: new Date(date)
            }
          },
          update: { status: record.status, markedBy: req.user.profile.id },
          create: {
            studentId: record.studentId,
            courseId,
            date: new Date(date),
            status: record.status,
            markedBy: req.user.profile.id
          }
        })
      )
    );

    res.json({ message: 'Attendance marked successfully', count: attendanceRecords.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance records for a course
 * GET /api/faculty/attendance/:courseId
 */
const getAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    const where = { courseId };
    if (date) where.date = new Date(date);

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, studentId: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ attendance });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload study material
 * POST /api/faculty/materials
 */
const uploadMaterial = async (req, res, next) => {
  try {
    const { title, description, fileUrl, fileType, courseId } = req.body;

    if (!title || !fileUrl || !courseId) {
      return res.status(400).json({ error: 'Title, file URL, and course ID are required.' });
    }

    // Verify faculty is assigned to this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, facultyId: req.user.profile.id }
    });

    if (!course) {
      return res.status(403).json({ error: 'You are not assigned to this course.' });
    }

    const material = await prisma.studyMaterial.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        courseId,
        uploadedBy: req.user.profile.id
      }
    });

    res.status(201).json({ message: 'Material uploaded successfully', material });
  } catch (error) {
    next(error);
  }
};

/**
 * Enter grades for students
 * POST /api/faculty/grades
 */
const enterGrades = async (req, res, next) => {
  try {
    const { courseId, semester, grades } = req.body;

    if (!courseId || !semester || !grades || !Array.isArray(grades)) {
      return res.status(400).json({ error: 'Course ID, semester, and grades array are required.' });
    }

    // Verify faculty is assigned to this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, facultyId: req.user.profile.id }
    });

    if (!course) {
      return res.status(403).json({ error: 'You are not assigned to this course.' });
    }

    const gradeRecords = await Promise.all(
      grades.map(g =>
        prisma.grade.upsert({
          where: {
            studentId_courseId_semester: {
              studentId: g.studentId,
              courseId,
              semester
            }
          },
          update: {
            midterm: g.midterm,
            final: g.final,
            assignment: g.assignment,
            totalMarks: g.totalMarks,
            grade: g.grade,
            gpa: g.gpa,
            gradedBy: req.user.profile.id
          },
          create: {
            studentId: g.studentId,
            courseId,
            semester,
            midterm: g.midterm,
            final: g.final,
            assignment: g.assignment,
            totalMarks: g.totalMarks,
            grade: g.grade,
            gpa: g.gpa,
            gradedBy: req.user.profile.id
          }
        })
      )
    );

    res.json({ message: 'Grades entered successfully', count: gradeRecords.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard stats for faculty
 * GET /api/faculty/stats
 */
const getStats = async (req, res, next) => {
  try {
    const profileId = req.user.profile.id;
    
    const [coursesCount, totalStudents, pendingAttendance] = await Promise.all([
      prisma.course.count({ where: { facultyId: profileId } }),
      prisma.enrollment.count({
        where: { course: { facultyId: profileId }, isActive: true }
      }),
      prisma.course.count({
        where: {
          facultyId: profileId,
          attendance: { none: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }
        }
      })
    ]);

    res.json({ stats: { coursesCount, totalStudents, pendingAttendance } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCourses, getCourseStudents, markAttendance,
  getAttendance, uploadMaterial, enterGrades, getStats
};
