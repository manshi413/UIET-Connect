const Attendance = require("../models/attendance.model");
const Student = require("../models/st");
const Subject = require("../models/subject.model");

module.exports = {
  // Record attendance for students in a specific subject
  recordAttendance: async (req, res) => {
    try {
      const { subjectId, attendanceData, date } = req.body;
      
      for (const student of attendanceData) {
        const attendanceRecord = new Attendance({
          student: student.studentId,
          subject: subjectId,
          status: student.status,
          date: date,
        });
        await attendanceRecord.save();
      }

      res.status(200).json({ success: true, message: "Attendance recorded successfully" });
    } catch (error) {
      console.log("Error recording attendance", error);
      res.status(500).json({ success: false, message: "Server error recording attendance" });
    }
  },

  // Fetch attendance data for all students in a selected semester, subject-wise
  getAttendanceBySemester: async (req, res) => {
    try {
      const { semesterId } = req.params;

      const subjects = await Subject.find({ student_class: semesterId });

      const attendanceData = {};

      for (const subject of subjects) {
        const attendanceRecords = await Attendance.find({ subject: subject._id })
          .populate('student')
          .lean();

        attendanceData[subject.subject_name] = attendanceRecords.map(record => ({
          studentName: `${record.student.first_name} ${record.student.last_name}`,
          status: record.status,
          date: record.date,
        }));
      }

      res.status(200).json({ success: true, data: attendanceData });
    } catch (error) {
      console.log("Error fetching attendance data", error);
      res.status(500).json({ success: false, message: "Server error fetching attendance data" });
    }
  }
};
