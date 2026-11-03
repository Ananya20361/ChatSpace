

const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

console.log("AUTH ROUTES LOADED - LOGIN WITHOUT EMAIL VERIFICATION");


// ======================================================
// TEST AUTH ROUTE
// ======================================================

router.get("/test", (req, res) => {
    res.send("Auth routes are working!");
});


// ======================================================
// REGISTER
// ======================================================

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create email verification token
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        const verificationTokenExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpires: verificationTokenExpires
        });

        // Send verification email.
        // Verification is NOT required for login.
        await sendEmail(
            email,
            verificationToken,
            "verification"
        );

        res.status(201).json({
            message: "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("REGISTRATION ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ======================================================
// VERIFY EMAIL
// ======================================================

router.get("/verify/:token", async (req, res) => {
    console.log("VERIFY ROUTE HIT");

    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        res.json({
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("VERIFICATION ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check input
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.trim()
        });

        // User does not exist
        if (!user) {
            console.log("LOGIN DEBUG: User not found for:", email);

            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        console.log("LOGIN DEBUG");
        console.log("Email entered:", email);
        console.log("User found:", user.email);
        console.log("Password hash exists:", !!user.password);

        // Compare entered password with stored password hash
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        console.log(
            "Password matches:",
            isPasswordCorrect
        );

        // Wrong password
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // ==================================================
        // IMPORTANT:
        // NO EMAIL VERIFICATION CHECK HERE.
        //
        // A user can log in even when:
        // user.isVerified === false
        // ==================================================

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        console.log(
            "LOGIN SUCCESS:",
            user.email
        );

        res.json({
            message: "Login successful",

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ======================================================
// GET ALL USERS
// ======================================================

router.get("/users", authMiddleware, async (req, res) => {
    try {
        const users = await User.find(
            {
                _id: {
                    $ne: req.userId
                }
            },
            {
                name: 1,
                email: 1,
                isVerified: 1
            }
        );

        res.json({
            users: users
        });

    } catch (error) {
        console.error("GET USERS ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please provide your email"
            });
        }

        const user = await User.findOne({
            email: email.trim()
        });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        // Generate secure reset token
        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Token expires after 15 minutes
        const resetTokenExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpires =
            resetTokenExpires;

        await user.save();

        // Send password reset email
        await sendEmail(
            email,
            resetToken,
            "reset"
        );

        res.json({
            message: "Password reset link sent to your email"
        });

    } catch (error) {
        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ======================================================
// RESET PASSWORD
// ======================================================

router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Please provide a new password"
            });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        user.password = hashedPassword;

        // Delete reset token
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;

        await user.save();

        res.json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ======================================================
// RESEND VERIFICATION EMAIL
// ======================================================

router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please provide your email"
            });
        }

        const user = await User.findOne({
            email: email.trim()
        });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        // Already verified
        if (user.isVerified) {
            return res.status(400).json({
                message: "This email is already verified"
            });
        }

        // Generate new verification token
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Token expires after 24 hours
        const verificationTokenExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        user.verificationToken = verificationToken;
        user.verificationTokenExpires =
            verificationTokenExpires;

        await user.save();

        // Send verification email again
        await sendEmail(
            email,
            verificationToken,
            "verification"
        );

        res.json({
            message: "Verification email sent again"
        });

    } catch (error) {
        console.error(
            "RESEND VERIFICATION ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;

