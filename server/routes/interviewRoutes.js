const JobApplication = require("../model/JobApplication");
const express = require("express");
const Job = require("../model/Job");
const User = require("../model/User");
const SelectedStudent = require("../model/SelectedStudent");


const router = express.Router();
const Interview = require("../model/interviewSchema");

const dotenv = require("dotenv");
dotenv.config({ path: './server/.env' });
router.get("/userSelected/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const offeredJobs = await SelectedStudent.find({ userId })
            .populate("jobId", "title company")
            .select("_id jobId company selectedAt");

        if (!offeredJobs.length) {
            return res.status(404).json({ success: false, message: "Student has not been selected for any job." });
        }

        res.status(200).json({ success: true, data: offeredJobs });
    } catch (error) {
        console.error("Error checking student's selection status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
router.get("/selected-students/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;

        const selectedStudents = await SelectedStudent.find({ jobId: jobId })
            .populate("userId", "fullName branch")
            .exec();
        console.log(selectedStudents)
        if (!selectedStudents.length) {
            return res.status(404).json({ message: "No students found for this job." });
        }

        res.status(200).json({ success: true, data: selectedStudents });
    } catch (error) {
        console.error("Error fetching selected students:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
router.get("/selected-students", async (req, res) => {
    try {
        const selectedStudents = await SelectedStudent.find()
            .populate("userId", "fullName email")
            .populate("jobId", "title company");

        res.json({ data: selectedStudents });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
router.post("/select-student", async (req, res) => {
    try {
        const { userId, jobId } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { placementStatus: "placed", company: job.company },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const selectedStudent = new SelectedStudent({
            userId,
            jobId,
            company: job.company
        });
        await selectedStudent.save();

        res.json({ message: "Student placed successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/schedule-all/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;

        const { roundName, scheduledAt, mode, interviewer } = req.body;

        const applications = await JobApplication.find({ job: jobId, coordinatorApproved: true })
            .populate("user", "fullName email")
            .populate("job", "title company");

        if (applications.length === 0) {
            return res.status(404).json({ message: "No approved applications found for this job." });
        }

        const scheduledInterviews = [];

        for (const application of applications) {
            let interview = await Interview.findOne({ user: application.user._id, job: application.job._id });

            if (!interview) {
                interview = new Interview({ user: application.user._id, job: application.job._id, applicationId: application._id, rounds: [] });
            }


            interview.rounds.push({ roundName, scheduledAt, mode, interviewer });
            await interview.save();

            scheduledInterviews.push(interview);
        }

        return res.status(201).json({ message: `All interviews for Job ID ${jobId} scheduled successfully.`, scheduledInterviews });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/schedule", async (req, res) => {
    try {
        const { applicationId, roundName, scheduledAt, mode, interviewer } = req.body;

        // Find the job application with populated fields
        const application = await JobApplication.findById(applicationId)
            .populate("user", "fullName email")
            .populate("job", "title company");

        if (!application) return res.status(404).json({ message: "Application not found." });

        if (!application.coordinatorApproved) {
            return res.status(400).json({ message: "Interview cannot be scheduled without coordinator approval." });
        }

        // Check if an interview already exists
        let interview = await Interview.findOne({ user: application.user._id, job: application.job._id });

        if (!interview) {
            interview = new Interview({ user: application.user._id, job: application.job._id, applicationId, rounds: [] });
        }

        // Add new round
        interview.rounds.push({ roundName, scheduledAt, mode, interviewer });

        await interview.save();




        return res.status(201).json({ message: "Interview round scheduled successfully.", interview });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const interviews = await Interview.find({ user: req.params.userId }).populate("job", "title company");
        return res.status(200).json(interviews);
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.patch("/:interviewId/round/:roundIndex", async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["scheduled", "completed", "rescheduled", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status update." });
        }

        const interview = await Interview.findById(req.params.interviewId);
        if (!interview) return res.status(404).json({ message: "Interview not found." });

        const roundIndex = parseInt(req.params.roundIndex);

        if (roundIndex < 0 || roundIndex >= interview.rounds.length) {
            return res.status(400).json({ message: "Invalid interview round index." });
        }

        // Update round status
        interview.rounds[roundIndex].status = status;
        await interview.save();

        return res.status(200).json({ message: "Interview round status updated successfully.", interview });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});
router.get("/application/:applicationId", async (req, res) => {
    try {
        const interview = await Interview.findOne({ applicationId: req.params.applicationId });
        if (!interview) {
            return res.status(404).json({ message: "Interview not found." });
        }
        return res.status(200).json(interview);
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
