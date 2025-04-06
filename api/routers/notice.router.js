const express = require("express");
const authMiddleware = require("../auth/auth");
const { createNotice, getAllNotices, updateNoticeWithId, deleteNoticeWithId, getTeacherNotices, getStudentNotices } = require("../controllers/notice.controller");

const router = express.Router();

router.post("/create", authMiddleware(["DEPARTMENT"]), createNotice);
router.get("/all", authMiddleware(["DEPARTMENT"]), getAllNotices);
router.get("/teacher", authMiddleware(["TEACHER"]), getTeacherNotices);
router.get("/student", authMiddleware(["STUDENT"]), getStudentNotices);
router.patch(
  "/update/:id",
  authMiddleware(["DEPARTMENT"]),
  updateNoticeWithId
);
router.get("/delete/:id", authMiddleware(["DEPARTMENT"]), deleteNoticeWithId);

module.exports = router;