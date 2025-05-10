const mongoose = require("mongoose");

const SelectedStudentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    company: { type: String, required: true },
    selectedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SelectedStudent", SelectedStudentSchema);
