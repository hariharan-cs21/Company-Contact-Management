const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String },
	userType: {
		type: String,
		enum: ["student", "recruiter", "placement_coordinator"],
		required: true,
	},
	passwordSet: { type: Boolean, default: false },

	enrollmentNumber: {
		type: String,
		required: function () { return this.userType === "student"; }
	},
	branch: {
		type: String,
		required: function () { return this.userType === "student"; }
	},
	passingYear: {
		type: Number,
		required: function () { return this.userType === "student"; }
	},
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

userSchema.index(
	{ enrollmentNumber: 1 },
	{
		unique: true,
		partialFilterExpression: { userType: "student" },
	}
);

userSchema.pre("save", function (next) {
	if (this.userType !== "student") {
		this.enrollmentNumber = undefined;
		this.branch = undefined;
		this.passingYear = undefined;
		this.resumeLink = undefined;
		this.appliedJobs = undefined;
		this.cgpa = undefined;
		this.skills = undefined;
		this.experience = undefined;
		this.certifications = undefined;
		this.projects = undefined;
		this.contactNumber = undefined;
		this.linkedinProfile = undefined;
		this.portfolioLink = undefined;
		this.placementStatus = undefined;
		this.company = undefined;
	}
	next();
});

module.exports = mongoose.model("User", userSchema);