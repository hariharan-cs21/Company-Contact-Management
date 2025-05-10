const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobApplicationSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
	status: {
		type: String,
		enum: ["pending", "accepted", "rejected", "not eligible"], // Added "not eligible"
		default: "pending",
	},
	appliedAt: { type: Date, default: Date.now },
	coordinatorApproved: { type: Boolean, default: null }, // Track approval
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
