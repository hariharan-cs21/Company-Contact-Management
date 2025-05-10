const express = require("express");
const { addJob, getJobs, applyJob, getApplications, getAppliedJobs, reviewApplication } = require("../controllers/Recruiter/jobController");
const Job = require("../model/Job");

const router = express.Router();

router.post("/post-job", addJob);
router.get("/get-jobs", getJobs);
router.post("/apply-job", applyJob);
router.get("/applied-jobs/:userId", getAppliedJobs);

router.get("/get-applications/:jobId", getApplications);
router.put("/review-application/:applicationId", reviewApplication);
router.patch("/close-job/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findByIdAndUpdate(
            jobId,
            { status: "closed" },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ message: "Job closed successfully", job });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
