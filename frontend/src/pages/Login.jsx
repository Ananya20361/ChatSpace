
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle unverified account
        if (
          response.status === 403 &&
          data.message?.toLowerCase().includes("verify")
        ) {
          alert(
            "Your account is not verified yet.\n\nPlease open the verification email sent to your Gmail and click 'Verify My Email' before logging in."
          );
          return;
        }

        // Handle other login errors
        alert(data.message || "Login failed");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log("Login successful:", data);

      // Go to Chat page
      window.location.href = "/chat";

    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="auth-page">

      {/* BACK TO HOME */}
      <a href="/" className="back-home">
        ← Back to Home
      </a>

      <div className="auth-card">

        {/* TOP BRANDING */}
        <div className="auth-header">

          <div className="chat-logo">
            💬
          </div>

          <h1>ChatSpace</h1>

          <p>
            Welcome back! Let's get you chatting.
          </p>

        </div>

        {/* CHAT GRAPHIC */}
        <div className="chat-graphic">

          <div className="mini-avatar avatar-one">
            👩
          </div>

          <div className="mini-message mini-message-one">
            Hey! 👋
          </div>

          <div className="mini-message mini-message-two">
            Welcome back!
          </div>

          <div className="mini-avatar avatar-two">
            👨
          </div>

          <div className="online-status">
            <span></span>
            Online
          </div>

        </div>

        {/* LOGIN FORM */}
        <div className="auth-form">

          <h2>Login</h2>

          <p className="auth-subtitle">
            Sign in to continue to your account
          </p>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="auth-input-group">

              <label>
                📧 Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            {/* PASSWORD */}
            <div className="auth-input-group">

              <label>
                🔒 Password
              </label>

              <div className="password-container">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* FORGOT PASSWORD */}
            <div className="forgot-password">
              <a href="/forgot-password">
                Forgot password?
              </a>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="auth-button"
            >
              Login
              <span>→</span>
            </button>

          </form>

          {/* DIVIDER */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* REGISTER */}
          <p className="account-text">
            Don't have an account?
          </p>

          <a
            href="/register"
            className="outline-auth-button"
          >
            Create Account
          </a>

        </div>

      </div>

    </div>
  );
}

export default Login;