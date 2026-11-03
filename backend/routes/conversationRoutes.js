const express = require("express");
const Conversation = require("../models/conversation");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "Please provide a userId"
            });
        }

        if (userId === req.userId.toString()) {
            return res.status(400).json({
                message: "You cannot start a conversation with yourself"
            });
        }

        const otherUser = await User.findById(userId);

        if (!otherUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const existingConversation = await Conversation.findOne({
            participants: {
                $all: [req.userId, userId]
            }
        });

        if (existingConversation) {
            return res.json({
                message: "Conversation already exists",
                conversation: existingConversation
            });
        }

        const conversation = await Conversation.create({
            participants: [req.userId, userId]
        });

        res.status(201).json({
            message: "Conversation created successfully",
            conversation
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;