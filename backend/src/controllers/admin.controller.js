const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Onboard a new user (student or faculty)
 * POST /api/admin/onboard-user
 */
const onboardUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phone, departmentId, dateOfBirth } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be STUDENT, FACULTY, or ADMIN.' });
    }

    // Create in Supabase Auth
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { firstName, lastName, role }
    });

    if (supabaseError) {
      return res.status(400).json({ error: supabaseError.message });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const idPrefix = role === 'STUDENT' ? 'STU' : role === 'FACULTY' ? 'FAC' : 'ADM';
    const uniqueId = `${idPrefix}${Date.now().toString().slice(-8)}`;

    const user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.user.id,
        email,
        passwordHash,
        role,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            departmentId,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            ...(role === 'STUDENT' ? { studentId: uniqueId } : { employeeId: uniqueId })
          }
        }
      },
      include: { profile: { include: { department: true } } }
    });

    res.status(201).json({ message: 'User onboarded successfully', user });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new department
 * POST /api/admin/departments
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDept } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required.' });
    }

    const department = await prisma.department.create({
      data: { name, code, description, headOfDept }
    });

    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all departments
 * GET /api/admin/departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { profiles: true, courses: true } } }
    });
    res.json({ departments });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new course
 * POST /api/admin/courses
 */
const createCourse = async (req, res, next) => {
  try {
    const { name, code, description, credits, semester, departmentId, facultyId, maxCapacity } = req.body;

    if (!name || !code || !semester || !departmentId) {
      return res.status(400).json({ error: 'Name, code, semester, and department are required.' });
    }

    const course = await prisma.course.create({
      data: { name, code, description, credits, semester, departmentId, facultyId, maxCapacity },
      include: { department: true }
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses
 * GET /api/admin/courses
 */
const getCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
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
 * Track/Update fee status
 * POST /api/admin/fees
 */
const updateFeeStatus = async (req, res, next) => {
  try {
    const { studentId, semester, totalAmount, paidAmount, dueDate, status } = req.body;

    if (!studentId || !semester || !totalAmount || !dueDate) {
      return res.status(400).json({ error: 'Student ID, semester, total amount, and due date are required.' });
    }

    const feeStatus = await prisma.feeStatus.upsert({
      where: { studentId_semester: { studentId, semester } },
      update: { totalAmount, paidAmount, dueDate: new Date(dueDate), status },
      create: { studentId, semester, totalAmount, paidAmount: paidAmount || 0, dueDate: new Date(dueDate), status: status || 'PENDING' }
    });

    res.json({ message: 'Fee status updated', feeStatus });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all fee records
 * GET /api/admin/fees
 */
const getFees = async (req, res, next) => {
  try {
    const fees = await prisma.feeStatus.findMany({
      include: { student: { select: { firstName: true, lastName: true, studentId: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ fees });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with filters
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const where = {};
    
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: { profile: { include: { department: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users: users.map(u => ({ ...u, passwordHash: undefined })) });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard stats
 * GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
  try {
    const [totalStudents, totalFaculty, totalCourses, totalDepartments, pendingFees] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.department.count(),
      prisma.feeStatus.count({ where: { status: { in: ['PENDING', 'OVERDUE'] } } })
    ]);

    res.json({ stats: { totalStudents, totalFaculty, totalCourses, totalDepartments, pendingFees } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  onboardUser, createDepartment, getDepartments,
  createCourse, getCourses, updateFeeStatus, getFees,
  getUsers, getStats
};
