const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.ObjectId, ref: "Department" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: { type: String, enum: ["student", "teacher"], require: true },

  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Notice", noticeSchema);
