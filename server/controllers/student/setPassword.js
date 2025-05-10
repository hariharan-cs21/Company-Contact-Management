const User = require("../../model/User");
const bcrypt = require("bcryptjs");

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
