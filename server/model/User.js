const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String },
	userType: { type: String, enum: ["student", "recruiter", "placement_coordinator"], required: true },
	passwordSet: { type: Boolean, default: false },

	// Placement-related required fields
	enrollmentNumber: { type: String, required: true, unique: true },
	branch: { type: String, required: true },
	passingYear: { type: Number, required: true },
	resumeLink: { type: String },
	appliedJobs: { type: [Schema.Types.ObjectId], ref: "Job", default: [] },

	cgpa: { type: Number, min: 0, max: 10 },
	skills: { type: [String], default: [] },
	experience: { type: String },
	certifications: { type: [String], default: [] },
	projects: { type: [String], default: [] },
	contactNumber: { type: String },
	linkedinProfile: { type: String },
	portfolioLink: { type: String },
	placementStatus: {
		type: String,
		enum: ["placed", "not placed", "in process"],
		default: "not placed",
	},
	company: {
		type: String,
		default: "",
	},
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
