import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/auth/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to send reset link.");
                return;
            }

            setMessage(
                "Password reset link has been sent to your email."
            );

        } catch (error) {
            console.error("Forgot password error:", error);
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <a href="/login" className="back-home">
                ← Back to Login
            </a>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="chat-logo">🔐</div>

                    <h1>ChatSpace</h1>

                    <p>
                        Reset your password and get back to chatting.
                    </p>
                </div>

                <div className="auth-form">
                    <h2>Forgot Password?</h2>

                    <p className="auth-subtitle">
                        Enter your registered email address and we'll
                        send you a password reset link.
                    </p>

                    <form onSubmit={handleForgotPassword}>
                        <div className="form-group">
                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        {message && (
                            <div className="success-message">
                                ✅ {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending..."
                                : "Send Reset Link"}
                            {!loading && <span>→</span>}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Remember your password?{" "}
                        <a href="/login">Login</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;