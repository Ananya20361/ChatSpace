const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const Message = require("./models/message");
const Conversation = require("./models/conversation");

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// ================= SOCKET.IO =================

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

// Store connected users' socket IDs
const userSockets = new Map();

// ================= SOCKET CONNECTION =================

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // ================= REGISTER USER =================

    socket.on("registerUser", (userId) => {
        if (!userId) return;

        const id = userId.toString();

        userSockets.set(id, socket.id);
        socket.userId = id;

        console.log(
            `Socket ${socket.id} registered for user ${id}`
        );
    });

    // ================= JOIN CONVERSATION =================

    socket.on("joinConversation", (conversationId) => {
        if (!conversationId) return;

        socket.join(conversationId.toString());

        console.log(
            `Socket ${socket.id} joined conversation ${conversationId}`
        );
    });

    // ================= SEND MESSAGE =================

    socket.on("sendMessage", async (data) => {
        try {
            const { conversationId, sender, text } = data || {};

            if (
                !conversationId ||
                !sender ||
                typeof text !== "string" ||
                !text.trim()
            ) {
                return;
            }

            // Confirm the sender matches the registered socket user
            if (
                !socket.userId ||
                socket.userId !== sender.toString()
            ) {
                console.log("Blocked message: sender mismatch.");
                return;
            }

            // Validate conversation ID before querying MongoDB
            if (!mongoose.isValidObjectId(conversationId)) {
                console.log("Blocked message: invalid conversation ID.");
                return;
            }

            const conversation = await Conversation.findById(
                conversationId
            );

            if (!conversation) {
                console.log("Conversation not found.");
                return;
            }

            const participantIds = conversation.participants.map(
                (participant) => participant.toString()
            );

            // Prevent invalid conversations and self-chat
            if (
                participantIds.length !== 2 ||
                participantIds[0] === participantIds[1]
            ) {
                console.log("Blocked invalid or self conversation.");
                return;
            }

            // Sender must be a conversation participant
            if (!participantIds.includes(sender.toString())) {
                console.log("Blocked message: sender is not a participant.");
                return;
            }

            // Save message to MongoDB
            const message = await Message.create({
                conversationId,
                sender,
                text: text.trim()
            });

            // Deliver once to each connected participant
            for (const participantId of participantIds) {
                const socketId = userSockets.get(participantId);

                if (socketId) {
                    io.to(socketId).emit("newMessage", message);
                }
            }

            console.log(
                `Message saved and delivered in conversation ${conversationId}`
            );

        } catch (error) {
            console.error("Socket message error:", error);
        }
    });

    // ================= DISCONNECT =================

    socket.on("disconnect", () => {
        if (socket.userId) {
            const registeredSocket = userSockets.get(socket.userId);

            if (registeredSocket === socket.id) {
                userSockets.delete(socket.userId);
            }
        }

        console.log("A user disconnected:", socket.id);
    });
});

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
    res.status(200).send("Chat application backend is running!");
});

// ================= API ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// ================= MONGODB AND SERVER =================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        server.listen(PORT, "0.0.0.0", () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });
