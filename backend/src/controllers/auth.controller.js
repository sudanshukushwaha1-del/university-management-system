const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phone, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Create user in Supabase Auth
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { firstName, lastName, role: role || 'STUDENT' }
    });

    if (supabaseError) {
      return res.status(400).json({ error: supabaseError.message });
    }

    // Hash password for local storage
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate student/employee ID
    const userRole = role || 'STUDENT';
    const idPrefix = userRole === 'STUDENT' ? 'STU' : userRole === 'FACULTY' ? 'FAC' : 'ADM';
    const uniqueId = `${idPrefix}${Date.now().toString().slice(-8)}`;

    // Create user in local database
    const user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.user.id,
        email,
        passwordHash,
        role: userRole,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            departmentId,
            ...(userRole === 'STUDENT' ? { studentId: uniqueId } : { employeeId: uniqueId })
          }
        }
      },
      include: { profile: true }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: { include: { department: true } } }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated. Contact admin.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          id: user.profile?.id,
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
          studentId: user.profile?.studentId,
          employeeId: user.profile?.employeeId,
          department: user.profile?.department,
          avatarUrl: user.profile?.avatarUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: { include: { department: true } } }
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
