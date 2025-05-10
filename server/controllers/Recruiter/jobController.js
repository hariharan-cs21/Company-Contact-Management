const JobApplication = require("../../model/JobApplication");
const Job = require("../../model/Job");
const User = require("../../model/User");

exports.addJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();

    res.status(201).json({ message: "Job added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.applyJob = async (req, res) => {
  try {
    const { userId, jobId } = req.body;

    // Check if the user has already applied
    const existingApplication = await JobApplication.findOne({ user: userId, job: jobId });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Create a new job application
    const application = new JobApplication({
      user: userId,
      job: jobId,
      status: "pending",
    });

    await application.save();
    res.status(201).json({ message: "Job application submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Get Applied Jobs
exports.getAppliedJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all applications for the student
    const applications = await JobApplication.find({ user: userId }).populate("job");

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getApplications = async (req, res) => {

  try {
    const { jobId } = req.params;
    const userRole = req.session.user.type; // Get role from authenticated user

    let applications;

    if (userRole === "placement_coordinator") {
      // Placement Coordinator sees all applications
      applications = await JobApplication.find({ job: jobId }).populate("user");
    } else if (userRole === "recruiter") {
      // Recruiter sees only approved applications
      applications = await JobApplication.find({
        job: jobId,
        coordinatorApproved: true, // Only approved applications
        status: { $ne: "not eligible" }, // Exclude "not eligible"
      }).populate("user");
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { action } = req.body; // "approve" or "reject"

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (action === "approve") {
      application.coordinatorApproved = true;
      application.status = "accepted"; // Mark as accepted
    } else if (action === "reject") {
      application.status = "not eligible"; // Mark as not eligible
      application.coordinatorApproved = false;
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await application.save();
    res.status(200).json({ message: `Application marked as ${application.status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
