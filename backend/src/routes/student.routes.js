const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getAttendance, getGrades, getAvailableCourses,
  registerCourse, getMyCourses, getDigitalId,
  getMaterials, getFeeStatus, getStats
} = require('../controllers/student.controller');

// All student routes require authentication and STUDENT role
router.use(authenticate, authorize('STUDENT'));

// Dashboard
router.get('/stats', getStats);

// Attendance
router.get('/attendance', getAttendance);

// Grades
router.get('/grades', getGrades);

// Course registration
router.get('/available-courses', getAvailableCourses);
router.get('/my-courses', getMyCourses);
router.post('/register-course', registerCourse);

// Digital ID
router.get('/digital-id', getDigitalId);

// Study materials
router.get('/materials', getMaterials);

// Fee status
router.get('/fees', getFeeStatus);

module.exports = router;
