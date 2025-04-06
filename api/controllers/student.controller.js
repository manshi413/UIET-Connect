require("dotenv").config();
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Student = require("../models/student.model");

module.exports = {
  registerStudent: async (req, res) => {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        const student = await Student.findOne({ email: fields.email[0] });
        if (student) {
          return res.status(409).json({
            success: false,
            message: "Student already exists with this email.",
          });
        } else {
          const photo = files.image[0];
          let filepath = photo.filepath;
          let originalFilename = photo.originalFilename.replace(" ", "_");
          let newPath = path.join(
            __dirname,
            process.env.STUDENT_IMAGE_PATH,
            originalFilename
          );

          let photoData = fs.readFileSync(filepath);
          fs.writeFileSync(newPath, photoData);

          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(fields.password[0], salt);
          const newStudent = new Student({
            department: req.user.departmentId,
            email: fields.email[0],
            name: fields.name[0],
            student_class: fields.student_class[0],
            gender: fields.gender[0],
            age: fields.age[0],
            student_contact: fields.student_contact[0],
            guardian: fields.guardian[0],
            guardian_phone: fields.guardian_phone[0],
            student_image: originalFilename,
            password: hashPassword,
          });

          const savedStudent = await newStudent.save();
          res.status(200).json({
            success: true,
            data: savedStudent,
            message: "Student registered successfully",
          });
        }
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Student registration failed" });
    }
  },

  //login for Student
  loginStudent: async (req, res) => {
    try {
      const student = await Student.findOne({ email: req.body.email });
      if (student) {
        const isAuth = bcrypt.compareSync(req.body.password, student.password);
        if (isAuth) {
          const jwtSecret = process.env.JWT_SECRET;
          const token = jwt.sign(
            {
              id: student._id,
              department_id: student.department,
              name: student.student_name,
              image_url: student.student_image,
              role: "STUDENT",
            },
            jwtSecret
          );

          res.header("Authorization", token);
          res.status(200).json({
            success: true,
            message: "successfully login",
            user: {
              id: student._id,
              departmentId: student.department,
              student_name: student.student_name,
              image_url: student.student_image,
              role: "STUDENT",
            },
          });
        } else {
          res.status(401).json({ success: false, message: "invalid password" });
        }
      } else {
        res.status(401).json({ success: false, message: "Student not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[Student login].",
      });
    }
  },
  // get all Student data
  getStudentsWithQuery: async (req, res) => {
    try {
      const filterQuery = {};
      const departmentId = req.user.departmentId;
      filterQuery["department"] = departmentId;

      if (req.query.hasOwnProperty("search")) {
        filterQuery["name"] = { $regex: req.query.search, $options: "i" };
      }

      if (req.query.hasOwnProperty("student_class")) {
        filterQuery["student_class"] = req.query.student_class;
      }

      const students = await Student.find(filterQuery)
        .populate("student_class");
      res.status(200).json({
        success: true,
        message: "success in fetching all Students",
        students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[all Student]",
      });
    }
  },

  //get Student own data
  getStudentOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const departmentId = req.user.departmentId;
      const student = await Student.findOne({
        _id: id,
        department: departmentId,
      }).select(["-password"]);
      if (student) {
        res.status(200).json({ success: true, student });
      } else {
        res.status(404).json({ success: false, message: "Student not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[own  Student data]",
      });
    }
  },
  getStudentWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const departmentId = req.user.departmentId;
      const student = await Student.findOne({
        _id: id,
        department: departmentId,
      }).select(["-password"]);
      if (student) {
        res.status(200).json({ success: true, student });
      } else {
        res.status(404).json({ success: false, message: "Student not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[own  Student data]",
      });
    }
  },

  updateStudent: async (req, res) => {
    try {
      const id = req.params.id;
      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error in form parsing" });
        }

        const student = await Student.findOne({ _id: id });
        if (!student) {
          return res.status(404).json({ success: false, message: "Student not found" });
        }

        if (files.image) {
          const photo = files.image[0];
          let filepath = photo.filepath;
          let originalFilename = photo.originalFilename.replace(" ", "_");

          if (student.student_image) {
            let oldImagePath = path.join(__dirname, process.env.STUDENT_IMAGE_PATH, student.student_image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlink(oldImagePath, (err) => { if (err) console.log("Error deleting old image:", err); });
            }
          }

          let newPath = path.join(__dirname, process.env.STUDENT_IMAGE_PATH, originalFilename);
          let photoData = fs.readFileSync(filepath);
          fs.writeFileSync(newPath, photoData);

          student.student_image = originalFilename;
        }

        Object.keys(fields).forEach((field) => {
          if (field !== 'password') {
            student[field] = fields[field][0];
          }
        });

        await student.save();

        res.status(200).json({ success: true, message: "Student updated successfully", student });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Error updating Student" });
    }
  },

  deleteStudentWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const departmentId = req.user.departmentId;
      const student = await Student.findOneAndDelete({
        _id: id,
        department: departmentId,
      });
      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }
      res.status(200).json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting Student" });
    }
  },
};
