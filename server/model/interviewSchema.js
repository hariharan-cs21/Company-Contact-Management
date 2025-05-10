const mongoose = require("mongoose");

const interviewRoundSchema = new mongoose.Schema({
	roundName: { type: String, required: true },
	scheduledAt: { type: Date, required: true },
	status: { type: String, enum: ["scheduled", "completed", "rescheduled", "cancelled"], default: "scheduled" },
	mode: { type: String, enum: ["online", "offline"], required: true },
	interviewer: { type: String, required: true }
});

const interviewSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
	applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' },
	rounds: [interviewRoundSchema],
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", interviewSchema);
