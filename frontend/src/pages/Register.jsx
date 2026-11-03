import { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Register response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        setRegisteredEmail(email);
        setRegistered(true);
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="auth-page">

      {/* BACK TO HOME */}
      <a href="/" className="back-home">
        ← Back to Home
      </a>

      <div className="auth-card">

        {/* BRANDING */}
        <div className="auth-header">

          <div className="chat-logo">
            {registered ? "📧" : "💬"}
          </div>

          <h1>ChatSpace</h1>

          <p>
            {registered
              ? "One more step to activate your account."
              : "Create your account and start chatting."}
          </p>

        </div>

        {!registered ? (

          <>
            {/* CHAT GRAPHIC */}
            <div className="chat-graphic">

              <div className="mini-avatar avatar-one">
                👩
              </div>

              <div className="mini-message mini-message-one">
                Hey! 👋
              </div>

              <div className="mini-message mini-message-two">
                Let's connect!
              </div>

              <div className="mini-avatar avatar-two">
                👨
              </div>

              <div className="online-status">
                <span></span>
                People are chatting
              </div>

            </div>

            {/* REGISTER FORM */}
            <div className="auth-form">

              <h2>Create Account</h2>

              <p className="auth-subtitle">
                Join ChatSpace and connect with people
              </p>

              <form onSubmit={handleRegister}>

                {/* NAME */}
                <div className="auth-input-group">

                  <label>
                    👤 Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />

                </div>

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
                      placeholder="Create a password"
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
                      {showPassword ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>

                {/* REGISTER BUTTON */}
                <button
                  type="submit"
                  className="auth-button"
                >
                  Create Account
                  <span>→</span>
                </button>

              </form>

              {/* DIVIDER */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              {/* LOGIN */}
              <p className="account-text">
                Already have an account?
              </p>

              <a
                href="/login"
                className="outline-auth-button"
              >
                Login
              </a>

            </div>
          </>

        ) : (

          /* EMAIL VERIFICATION SCREEN */
          <div className="auth-form verification-screen">

            <div className="verification-icon">
              ✉️
            </div>

            <h2>Check Your Email</h2>

            <p className="auth-subtitle">
              We've sent a verification link to:
            </p>

            <p className="verification-email">
              {registeredEmail}
            </p>

            <div className="verification-message">
              <p>
                📧 Open your Gmail inbox and find the
                email from <strong>ChatSpace</strong>.
              </p>

              <p>
                Click <strong>"Verify My Email"</strong> to
                activate your account.
              </p>
            </div>

            <div className="verification-note">
              🔒 You need to verify your email before
              logging in.
            </div>

            <a
              href="/login"
              className="outline-auth-button"
            >
              Go to Login
            </a>

            <p className="verification-small-text">
              Didn't receive the email? Check your
              spam/junk folder.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default Register;