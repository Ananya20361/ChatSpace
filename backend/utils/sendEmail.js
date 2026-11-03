
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (email, token, type = "verification") => {

    let subject;
    let title;
    let message;
    let buttonText;
    let link;
    let expiryText;

    // =========================
    // EMAIL VERIFICATION
    // =========================
    if (type === "verification") {

        link = `http://localhost:5000/api/auth/verify/${token}`;

        subject = "Verify your ChatSpace account";
        title = "💬 Welcome to ChatSpace!";
        message = `
            Thank you for creating a ChatSpace account.
            Please click the button below to verify your email address.
        `;
        buttonText = "Verify My Email";
        expiryText = "This verification link will expire in 24 hours.";
    }

    // =========================
    // PASSWORD RESET
    // =========================
    else if (type === "reset") {

        link = `http://localhost:5173/reset-password/${token}`;

        subject = "Reset your ChatSpace password";
        title = "🔐 Reset your ChatSpace password";
        message = `
            We received a request to reset your ChatSpace password.
            Click the button below to create a new password.
        `;
        buttonText = "Reset My Password";
        expiryText = "This password reset link will expire in 15 minutes.";
    }

    const mailOptions = {
        from: `"ChatSpace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                border-radius: 15px;
                background: #f5f7ff;
            ">

                <h1 style="color: #667eea;">
                    ${title}
                </h1>

                <p>
                    ${message}
                </p>

                <a
                    href="${link}"
                    style="
                        display: inline-block;
                        padding: 12px 25px;
                        background: #667eea;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    "
                >
                    ${buttonText}
                </a>

                <p style="margin-top: 25px; color: #777;">
                    ${expiryText}
                </p>

                <p style="color: #777;">
                    If you did not request this, you can safely ignore this email.
                </p>

            </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);
};

module.exports = sendEmail;

