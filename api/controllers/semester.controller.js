const Semester = require("../models/semester.model");
const Student = require("../models/student.model");
const Exam = require("../models/examination.model");
const Schedule = require("../models/schedule.model");
module.exports = {
  getAllSemesters: async (req, res) => {
    try {
      const departmentId = req.user.departmentId;
      const allSemesters = await Semester.find({ department: departmentId });
      res.status(200).json({
        success: true,
        message: "success in fetching all semester",
        data: allSemesters,
      });
    } catch (error) {
      console.log("getallsemesters error", error);
      res
        .status(500)
        .json({ success: false, message: "server error in getting classes" });
    }
  },

  createSemester: async (req, res) => {
    try {
      const newSemester = new Semester({
        department: req.user.departmentId,
        semester_text: req.body.semester_text,
        semester_num: req.body.semester_num,
      });

      await newSemester.save();
      res
        .status(200)
        .json({ success: true, message: "successfully created semester" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server error in creating semester" });
    }
  },
  updateSemesterWithId: async (req, res) => {
    try {
      let id = req.params.id;
      await Semester.findOneAndUpdate({ _id: id }, { $set: { ...req.body } });
      const semesterAfterUpdate = await Semester.findOne({ _id: id });
      res.status(200).json({
        success: true,
        message: "successfully updated semester",
        data: semesterAfterUpdate,
      });
    } catch (error) {
      console.log("updating semester error", error);
      res
        .status(500)
        .json({ success: false, message: "Server error in updating semester" });
    }
  },

  deleteSemesterWithId: async (req, res) => {
    try {
      let id = req.params.id;
      let departmentId = req.user.departmentId;

      const semesterStudentCount = (
        await Student.find({ student_class: id, department: departmentId })
      ).length;
      const semesterExamCount = (
        await Exam.find({ semester: id, department: departmentId })
      ).length;
      const semesterScheduleCount = (
        await Schedule.find({ semester: id, department: departmentId })
      ).length;

      if (
        semesterStudentCount === 0 &&
        semesterExamCount === 0 &&
        semesterScheduleCount === 0
      ) {
        await Semester.findOneAndDelete({ _id: id, department: departmentId });
        res
          .status(200)
          .json({ success: true, message: "successfully deleted semester" });
      } else {
        res
          .status(500)
          .json({ success: false, message: "this semester already in use" });
      }
    } catch (error) {
      console.log("deleting semester error", error);
      res
        .status(500)
        .json({ success: false, message: "Server error in deleting semester" });
    }
  },
};