const express = require("express");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", authMiddleware, async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                message: "Please provide an email to search"
            });
        }

        const user = await User.findOne({
            email: email
        }).select("_id name email isVerified");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;