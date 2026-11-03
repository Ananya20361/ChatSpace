const express = require("express");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { conversationId, text } = req.body;

        if (!conversationId || !text) {
            return res.status(400).json({
                message: "Please provide conversationId and text"
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const isParticipant = conversation.participants.some(
            participant => participant.toString() === req.userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not part of this conversation"
            });
        }

        const message = await Message.create({
            conversationId,
            sender: req.userId,
            text
        });

        res.status(201).json({
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
router.get("/:conversationId", authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const isParticipant = conversation.participants.some(
            participant => participant.toString() === req.userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not part of this conversation"
            });
        }

        const messages = await Message.find({
            conversationId: conversationId
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name email");

        res.json({
            messages
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
module.exports = router;