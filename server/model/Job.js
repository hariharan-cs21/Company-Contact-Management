const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true,
  },
  company: {
    type: String,
    required: false,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  skills: {
    type: String,
    required: false,
    trim: true,
  },
  batch: {
    type: String,
    required: false,
    trim: true,
  },
  location: {
    type: String,
    required: false,
    trim: true,
  },
  cycle: {
    type: String,
    required: false,
    trim: true,
  },
  deadline: {
    type: Date,
    required: false,
  },
  degree: {
    type: String,
    required: false,
    trim: true,
  },
  salary: {
    type: String,
    required: false,
    trim: true,
  },
  certifications: {
    type: String,
    required: false,
    trim: true,
  },
  cgpa: {
    type: Number,
    required: false,
    min: 0,
    max: 10,
  },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
