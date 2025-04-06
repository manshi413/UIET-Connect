const express = require("express");
const authMiddleware = require("../auth/auth");
const {
  
  registerTeacher,
  loginTeacher,
  updateTeacher,
  getTeacherOwnData,
  getTeachersWithQuery,
  getTeacherWithId,
  deleteTeacherWithId,
} = require("../controllers/teacher.controller");
const router = express.Router();

router.post("/register",authMiddleware(['DEPARTMENT']), registerTeacher);
router.get("/fetch-with-query",authMiddleware(['DEPARTMENT']), getTeachersWithQuery);
router.post("/login", loginTeacher);
router.patch("/update/:id",authMiddleware(["DEPARTMENT"]), updateTeacher);
router.get("/fetch-single",authMiddleware(["STUDENT"]),getTeacherOwnData);
router.get("/fetch/:id",authMiddleware(["DEPARTMENT"]),getTeacherWithId);
router.delete("/delete/:id",authMiddleware(["DEPARTMENT"]),deleteTeacherWithId);


module.exports = router;
