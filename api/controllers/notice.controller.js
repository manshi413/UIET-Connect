const Notice = require("../models/notice.model");

module.exports = {
  getAllNotices: async (req, res) => {
    try {
      const departmentId = req.user.departmentId;
      const allNotices = await Notice.find({ department: departmentId });
      res.status(200).json({
        success: true,
        message: "success in fetching all notice",
        data: allNotices,
      });
    } catch (error) {
      console.log("getallnotices error", error);
      res
        .status(500)
        .json({ success: false, message: "server error in getting classes" });
    }
  },
  getTeacherNotices: async (req, res) => {
    try {
      const departmentId = req.user.departmentId;
      const allNotices = await Notice.find({ department: departmentId, audience:"teacher" });
      res.status(200).json({
        success: true,
        message: "success in fetching all notice",
        data: allNotices,
      });
    } catch (error) {
      console.log("getallnotices error", error);
      res
        .status(500)
        .json({ success: false, message: "server error in getting classes" });
    }
  },
  getStudentNotices: async (req, res) => {
    try {
      const departmentId = req.user.departmentId;
      const allNotices = await Notice.find({ department: departmentId, audience:"student" });
      res.status(200).json({
        success: true,
        message: "success in fetching all notice",
        data: allNotices,
      });
    } catch (error) {
      console.log("getallnotices error", error);
      res
        .status(500)
        .json({ success: false, message: "server error in getting classes" });
    }
  },

  createNotice: async (req, res) => {
    try {
      const { title, message, audience } = req.body;
      const newNotice = new Notice({
        department: req.user.departmentId,
        title: title,
        message: message,
        audience: audience,
      });

      await newNotice.save();
      res
        .status(200)
        .json({ success: true, message: "successfully created notice" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server error in creating notice" });
    }
  },
  updateNoticeWithId: async (req, res) => {
    try {
      let id = req.params.id;
      await Notice.findOneAndUpdate({ _id: id }, { $set: { ...req.body } });
      const noticeAfterUpdate = await Notice.findOne({ _id: id });
      res.status(200).json({
        success: true,
        message: "successfully updated notice",
        data: noticeAfterUpdate,
      });
    } catch (error) {
      console.log("updating notice error", error);
      res
        .status(500)
        .json({ success: false, message: "Server error in updating notice" });
    }
  },

  deleteNoticeWithId: async (req, res) => {
    try {
      let id = req.params.id;
      let departmentId = req.user.departmentId;

        await Notice.findOneAndDelete({ _id: id, department: departmentId });
        res
          .status(200)
          .json({ success: true, message: "successfully deleted notice" });
      
    } catch (error) {
      console.log("deleting notice error", error);
      res
        .status(500)
        .json({ success: false, message: "Server error in deleting notice" });
    }
  },
};
