const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

// Route to mark attendance
router.post('/mark', attendanceController.markAttendance);

// Route to get attendance by student
router.get('/student/:studentId', attendanceController.getAttendance);

// Route to check attendance for a specific date and semester
router.get('/check/:semesterId', attendanceController.checkAttendance);

module.exports = router;
