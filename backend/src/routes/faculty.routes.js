const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getMyCourses, getCourseStudents, markAttendance,
  getAttendance, uploadMaterial, enterGrades, getStats
} = require('../controllers/faculty.controller');

// All faculty routes require authentication and FACULTY role
router.use(authenticate, authorize('FACULTY'));

// Dashboard
router.get('/stats', getStats);

// Course management
router.get('/courses', getMyCourses);
router.get('/courses/:courseId/students', getCourseStudents);

// Attendance
router.get('/attendance/:courseId', getAttendance);
router.post('/attendance', markAttendance);

// Study materials
router.post('/materials', uploadMaterial);

// Grades
router.post('/grades', enterGrades);

module.exports = router;
