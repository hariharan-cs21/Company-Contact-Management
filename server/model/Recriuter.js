const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recruiterSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recruiter", recruiterSchema);
