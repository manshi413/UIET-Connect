require("dotenv").config();
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Teacher = require("../models/teacher.model");

module.exports = {
  registerTeacher: async (req, res) => {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        const teacher = await Teacher.findOne({ email: fields.email[0] });
        if (teacher) {
          return res.status(409).json({
            success: false,
            message: "Teacher already exists with this email.",
          });
        } else {
          const photo = files.image[0];
          let filepath = photo.filepath;
          let originalFilename = photo.originalFilename.replace(" ", "_");
          let newPath = path.join(
            __dirname,
            process.env.TEACHER_IMAGE_PATH,
            originalFilename
          );

          let photoData = fs.readFileSync(filepath);
          fs.writeFileSync(newPath, photoData);

          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(fields.password[0], salt);
          const newTeacher = new Teacher({

            //  department: { type: mongoose.Schema.ObjectId, ref: "Department" },
            //   email: { type: String, required: true },
            //   name: { type: String, required: true },
            //   qualification: { type: String, required: true },
            //   gender: { type: String, required: true },
            //   age: { type: Number, required: true },
            //   department_image: { type: string, required: true },
            //   password: { type: string, required: true },


            department: req.user.departmentId,
            email: fields.email[0],
            name: fields.name[0],
            gender: fields.gender[0],
            age: fields.age[0],
            qualification: fields.qualification[0],
            teacher_image: originalFilename,
            password: hashPassword,
          });

          const savedTeacher = await newTeacher.save();
          res.status(200).json({
            success: true,
            data: savedTeacher,
            message: "Teacher registered successfully",
          });
        }
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Teacher registration failed" });
    }
  },

  //login for Teacher
  loginTeacher: async (req, res) => {
    try {
      const teacher = await Teacher.findOne({ email: req.body.email });
      if (teacher) {
        const isAuth = bcrypt.compareSync(req.body.password, teacher.password);
        if (isAuth) {
          const jwtSecret = process.env.JWT_SECRET;
          const token = jwt.sign(
            {
              id: teacher._id,
              department_id: teacher.department,
              name: teacher.teacher_name,
              image_url: teacher.teacher_image,
              role: "TEACHER",
            },
            jwtSecret
          );

          res.header("Authorization", token);
          res.status(200).json({
            success: true,
            message: "successfully login",
            user: {
              id: teacher._id,
              departmentId: teacher.department,
              teacher_name: teacher.teacher_name,
              image_url: teacher.teacher_image,
              role: "TEACHER",
            },
          });
        } else {
          res.status(401).json({ success: false, message: "invalid password" });
        }
      } else {
        res.status(401).json({ success: false, message: "Teacher not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[Teacher login].",
      });
    }
  },
  // get all Teacher data
  getTeachersWithQuery: async (req, res) => {
    try {
      const filterQuery = {};
      const departmentId = req.user.departmentId;
      filterQuery["department"] = departmentId;

      if (req.query.hasOwnProperty("search")) {
        filterQuery["name"] = { $regex: req.query.search, $options: "i" };
      }

      const teachers = await Teacher.find(filterQuery);
      res.status(200).json({
        success: true,
        message: "success in fetching all Teachers",
        teachers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[all Teacher]",
      });
    }
  },

  //get Teacher own data
  getTeacherOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const departmentId = req.user.departmentId;
      const teacher = await Teacher.findOne({
        _id: id,
        department: departmentId,
      }).select(["-password"]);
      if (teacher) {
        res.status(200).json({ success: true, teacher });
      } else {
        res.status(404).json({ success: false, message: "Teacher not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[own  Teacher data]",
      });
    }
  },
  getTeacherWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const departmentId = req.user.departmentId;
      const teacher = await Teacher.findOne({
        _id: id,
        department: departmentId,
      }).select(["-password"]);
      if (teacher) {
        res.status(200).json({ success: true, teacher });
      } else {
        res.status(404).json({ success: false, message: "Teacher not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[own  Teacher data]",
      });
    }
  },

  updateTeacher: async (req, res) => {
    try {
      const id = req.params.id;
      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error in form parsing" });
        }

        const teacher = await Teacher.findOne({ _id: id });
        if (!teacher) {
          return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        if (files.image) {
          const photo = files.image[0];
          let filepath = photo.filepath;
          let originalFilename = photo.originalFilename.replace(" ", "_");

          if (teacher.teacher_image) {
            let oldImagePath = path.join(__dirname, process.env.TEACHER_IMAGE_PATH, teacher.teacher_image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlink(oldImagePath, (err) => { if (err) console.log("Error deleting old image:", err); });
            }
          }

          let newPath = path.join(__dirname, process.env.TEACHER_IMAGE_PATH, originalFilename);
          let photoData = fs.readFileSync(filepath);
          fs.writeFileSync(newPath, photoData);

          teacher.teacher_image = originalFilename;
        }

        Object.keys(fields).forEach((field) => {
          if (field !== 'password') {
            teacher[field] = fields[field][0];
          }
        });

        await teacher.save();

        res.status(200).json({ success: true, message: "Teacher updated successfully", teacher });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Error updating Teacher" });
    }
  },

  deleteTeacherWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const departmentId = req.user.departmentId;
      const teacher = await Teacher.findOneAndDelete({
        _id: id,
        department: departmentId,
      });
      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }
      res.status(200).json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting Teacher" });
    }
  },
};
