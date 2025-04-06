const express = require("express");
const authMiddleware = require("../auth/auth");
const {
  
  registerStudent,
  loginStudent,
  updateStudent,
  getStudentOwnData,
  getStudentsWithQuery,
  getStudentWithId,
  deleteStudentWithId,
} = require("../controllers/student.controller");
const router = express.Router();

router.post("/register",authMiddleware(['DEPARTMENT']), registerStudent);
router.get("/fetch-with-query",authMiddleware(['DEPARTMENT']), getStudentsWithQuery);
router.post("/login", loginStudent);
router.patch("/update/:id",authMiddleware(["DEPARTMENT"]), updateStudent);
router.get("/fetch-single",authMiddleware(["STUDENT"]),getStudentOwnData);
router.get("/fetch/:id",authMiddleware(["DEPARTMENT"]),getStudentWithId);
router.delete("/delete/:id",authMiddleware(["DEPARTMENT"]),deleteStudentWithId);


module.exports = router;
