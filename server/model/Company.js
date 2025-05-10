const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema({
	name: { type: String, required: true },
	industry: { type: String, required: true },
	location: { type: String, required: true },
	recruiters: [{ type: Schema.Types.ObjectId, ref: "Recruiter" }],
	createdAt: { type: Date, default: Date.now },
	lastdate : { type : Date, default: Date.now}
});

module.exports = mongoose.model("Company", companySchema);
