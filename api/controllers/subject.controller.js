const Subject = require("../models/subject.model");
const Student = require("../models/student.model");
const Exam = require("../models/examination.model");
const Schedule = require("../models/schedule.model");
module.exports = {
  getAllSubjects: async (req, res) => {
    try {
      const departmentId = req.user.departmentId;
      const allSubjects = await Subject.find({ department: departmentId });
      res.status(200).json({
        success: true,
        message: "success in fetching all Subject",
        data: allSubjects,
      });
    } catch (error) {
      console.log("getallSubjects error", error);
      res
        .status(500)
        .json({ success: false, message: "server error in getting classes" });
    }
  },

  createSubject: async (req, res) => {
    try {
      const newSubject = new Subject({
        department: req.user.departmentId,
        subject_name: req.body.subject_name,
        subject_codename: req.body.subject_codename,
        student_class: req.body.student_class,
      });

      await newSubject.save();
      res
        .status(200)
        .json({ success: true, message: "successfully created Subject" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server error in creating Subject" });
    }
  },
  updateSubjectWithId: async (req, res) => {
    try {
      let id = req.params.id;
      await Subject.findOneAndUpdate({ _id: id }, { $set: { ...req.body } });
      const SubjectAfterUpdate = await Subject.findOne({ _id: id });
      res.status(200).json({
        success: true,
        message: "successfully updated Subject",
        data: SubjectAfterUpdate,
      });
    } catch (error) {
      console.log("updating Subject error", error);
      res
        .status(500)
        .json({ success: false, message: "Server error in updating Subject" });
    }
  },

  deleteSubjectWithId: async (req, res) => {
    try {
      let id = req.params.id;
      let departmentId = req.user.departmentId;

      const SubjectExamCount = (
        await Exam.find({ subject: id, department: departmentId })
      ).length;
      const SubjectScheduleCount = (
        await Schedule.find({ subject: id, department: departmentId })
      ).length;

      if (SubjectExamCount === 0 && SubjectScheduleCount === 0) {
        await Subject.findOneAndDelete({ _id: id, department: departmentId });
        res
          .status(200)
          .json({ success: true, message: "successfully deleted Subject" });
      } else {
        res
          .status(500)
          .json({ success: false, message: "this Subject already in use" });
      }
    } catch (error) {
      console.log("deleting Subject error", error);
      res
        .status(500)
        .json({ success: false, message: "Server error in deleting Subject" });
    }
  },

  getSubjectsWithQuery: async (req, res) => {
    try {
      const filterQuery = {};
      const departmentId = req.user.departmentId;
      filterQuery["department"] = departmentId;

      if (req.query.hasOwnProperty("student_class")) {
        filterQuery["student_class"] = req.query.student_class;
      }

      const subjects =
        await Subject.find(filterQuery).populate("student_class");
      res.status(200).json({
        success: true,
        message: "success in fetching all Students",
        subjects,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[all Student]",
      });
    }
  },
};
