const express = require("express");
const multer = require("multer");
const User = require("../model/User");

const {
    registerUser,
    loginUser,
    checkSession,
    logoutUser,
    uploadStudents,
    setPassword,

} = require("../controllers/authController");
const { addJob } = require("../controllers/Recruiter/jobController");
const validateUser = require("../middleware/validateUser");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", validateUser, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/session", checkSession);

router.post("/upload-students", upload.single("file"), uploadStudents);
router.post("/set-password", setPassword);
router.post("/add-job", addJob);
router.get("/profile", async (req, res) => {
    try {
        const { email } = req.query;

        // Ensure email is provided
        if (!email) {
            return res.status(400).json({ message: "Email is required to fetch profile" });
        }

        // Fetch user from the database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
router.put(
    "/profile",
    [
        body("fullName").optional().isString(),
        body("branch").optional().isString(),
        body("passingYear").optional().isNumeric(),
        body("cgpa").optional().isFloat({ min: 0, max: 10 }),
        body("skills").optional().isArray(),
        body("contactNumber").optional().isString(),
        body("linkedinProfile").optional().isURL(),
        body("resumeLink").optional().isURL(),
        body("placementStatus").optional().isIn(["placed", "not placed", "in process"]),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, ...updateData } = req.body;

            if (!email) {
                return res.status(400).json({ message: "Email is required to update profile" });
            }

            const updatedUser = await User.findOneAndUpdate(
                { email },
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ message: "Profile updated successfully", user: updatedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);
router.get('/getUserData', async (req, res) => {
    try {
        const data = await User.find({ userType: "student" })
        if (!data) throw new Error("No user found")
        res.json({ data })
    }
    catch (err) {
        res.send(err.message)
    }
})

module.exports = router;
