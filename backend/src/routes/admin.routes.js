const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  onboardUser, createDepartment, getDepartments,
  createCourse, getCourses, updateFeeStatus, getFees,
  getUsers, getStats
} = require('../controllers/admin.controller');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.post('/onboard-user', onboardUser);

// Department management
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);

// Course management
router.get('/courses', getCourses);
router.post('/courses', createCourse);

// Fee management
router.get('/fees', getFees);
router.post('/fees', updateFeeStatus);

module.exports = router;
