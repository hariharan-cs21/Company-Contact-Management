const User = require("../model/User");
const bcrypt = require("bcryptjs");
const xlsx = require("xlsx");

exports.checkSession = (req, res) => {
    if (req.session.user) {
        res.status(200).json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(200).json({ loggedIn: false });
    }
};



exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, userType } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            fullName,
            email,
            password: hashedPassword,
            userType,
            passwordSet: true,
        });
        await user.save();

        req.session.user = {
            id: user._id,
            fullname: user.fullName,
            email: user.email,
            userType: user.userType,
        };

        res.status(201).json({ message: "Registration successful", user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        if (!user.passwordSet) {
            return res.status(200).json({
                email,
                passwordSet: user.passwordSet,
                message: "You need to set your password before logging in."
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        req.session.user = {
            id: user.id,
            name: user.fullName,
            email: user.email,
            type: user.userType,
            passwordSet: user.passwordSet
        };

        res.status(200).json({ message: "Login successful", user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.logoutUser = (req, res) => {
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Logout failed" });
            }
            res.status(200).json({ message: "Logout successful" });
        });
    } else {
        res.status(400).json({ message: "No active session" });
    }
};


exports.uploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const students = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        for (let student of students) {
            const { fullName, email, cgpa, enrollmentNumber, branch, passingYear } = student;

            if (!fullName || !email || !enrollmentNumber || !branch || !passingYear) {
                return res.status(400).json({ message: "Missing required fields in the file" });
            }

            const parsedCGPA = !isNaN(parseFloat(cgpa)) ? parseFloat(cgpa) : null;
            const parsedPassingYear = !isNaN(parseInt(passingYear)) ? parseInt(passingYear) : null;

            let existingUser = await User.findOne({ email });
            if (!existingUser) {
                await new User({
                    fullName,
                    email,
                    userType: "student",
                    passwordSet: false,
                    cgpa: parsedCGPA,
                    enrollmentNumber,
                    branch,
                    passingYear: parsedPassingYear,
                }).save();
            } else {
                existingUser.cgpa = parsedCGPA;
                existingUser.enrollmentNumber = enrollmentNumber;
                existingUser.branch = branch;
                existingUser.passingYear = parsedPassingYear;
                await existingUser.save();
            }
        }

        res.status(200).json({ message: "Students uploaded successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.setPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user || user.passwordSet) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.passwordSet = true;
        await user.save();

        res.status(200).json({ message: "Password set successfully, please log in" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

