import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function Home() {
  const [messageText, setMessageText] = useState("");

  const sendMessage = () => {
    if (messageText.trim() === "") {
      return;
    }

    console.log("Message to send:", messageText);
    setMessageText("");
  };

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO:", socket.id);

      socket.emit(
        "joinConversation",
        "6a8fbcd45e3dc993cbd123e5"
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section id="title" className="gradient-background">
        <div className="container col-xxl-8 px-4 pt-5">
          <div className="row flex-lg-row-reverse align-items-center g-5 py-5">

            {/* CHAT PREVIEW */}
            <div className="col-10 col-sm-8 col-lg-6 mx-auto">
              <div className="chat-preview shadow-lg">

                <div className="chat-header">
                  <div className="online-dot"></div>
                  <strong>ChatSpace</strong>
                </div>

                <div className="messages">
                  <div className="message received">
                    Hey! How are you?
                  </div>

                  <div className="message sent">
                    I'm doing great! 😊
                  </div>

                  <div className="message received">
                    Want to chat?
                  </div>

                  <div className="message sent">
                    Absolutely!
                  </div>
                </div>

                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={sendMessage}
                  >
                    ➤
                  </button>
                </div>

              </div>
            </div>

            {/* HERO TEXT */}
            <div className="col-lg-6">
              <h1 className="display-5 fw-bold text-body-emphasis lh-1 mb-3">
                Connect. Chat. Stay Connected.
              </h1>

              <p className="lead mb-4">
                A secure real-time chat application where you
                can connect with people, start private conversations,
                and exchange messages instantly.
              </p>

              <div className="d-grid gap-2 d-md-flex justify-content-md-start">

                <a
                  href="/register"
                  className="btn btn-light btn-lg px-4 me-md-2"
                >
                  Create Account
                </a>

                <a
                  href="/login"
                  className="btn btn-outline-light btn-lg px-4"
                >
                  Login
                </a>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="container px-4 py-5">

          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">
              Everything you need to chat
            </h2>

            <p className="lead text-secondary">
              Built for simple, private and real-time communication.
            </p>
          </div>

          <div className="row g-4 py-3 row-cols-1 row-cols-lg-3">

            <div className="col d-flex align-items-start">
              <div className="feature-icon me-3">
                🔐
              </div>

              <div>
                <h3 className="fs-2">
                  Secure Accounts
                </h3>

                <p>
                  Create your own account and securely log in to your
                  personal chat space.
                </p>
              </div>
            </div>

            <div className="col d-flex align-items-start">
              <div className="feature-icon me-3">
                ⚡
              </div>

              <div>
                <h3 className="fs-2">
                  Real-Time Chat
                </h3>

                <p>
                  Send and receive messages instantly without refreshing
                  the page.
                </p>
              </div>
            </div>

            <div className="col d-flex align-items-start">
              <div className="feature-icon me-3">
                💬
              </div>

              <div>
                <h3 className="fs-2">
                  Private Conversations
                </h3>

                <p>
                  Find registered users and start one-to-one private
                  conversations.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section id="testimonial">
        <div className="my-5">
          <div className="p-5 text-center bg-body-tertiary">

            <div className="container py-5">
              <h2 className="text-body-emphasis">
                "Simple communication, without the unnecessary
                complications."
              </h2>

              <p className="col-lg-8 mx-auto lead mt-4">
                Chat with the people you care about through a fast,
                responsive and easy-to-use platform.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="container py-5">

          <div className="pricing-header p-3 pb-md-4 mx-auto text-center">
            <h2 className="display-4 fw-normal">
              Simple &amp; Free
            </h2>

            <p className="fs-5 text-body-secondary">
              Everything you need to communicate with other users.
            </p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 mb-3 text-center justify-content-center">

            <div className="col col-lg-5">
              <div className="card mb-4 rounded-3 shadow-sm">

                <div className="card-header py-3">
                  <h4 className="my-0 fw-normal">
                    Free
                  </h4>
                </div>

                <div className="card-body">

                  <h1 className="card-title pricing-card-title">
                    ₹0
                    <small className="text-body-secondary fw-light">
                      /forever
                    </small>
                  </h1>

                  <ul className="list-unstyled mt-3 mb-4">
                    <li>✓ Create an account</li>
                    <li>✓ Find registered users</li>
                    <li>✓ Private conversations</li>
                    <li>✓ Real-time messaging</li>
                  </ul>

                  <a
                    href="/register"
                    className="w-100 btn btn-lg btn-dark"
                  >
                    Create Account
                  </a>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section id="contact" className="gradient-background">

        <div className="container">

          <footer className="row row-cols-1 row-cols-sm-2 row-cols-md-4 py-5 mt-5">

            <div className="col mb-3">
              <h5>ChatSpace</h5>

              <p className="text-white-50">
                Connect and communicate in real time.
              </p>

              <p className="text-white-50">
                © 2026 ChatSpace
              </p>
            </div>

            <div className="col mb-3">
              <h5>Navigation</h5>

              <ul className="nav flex-column">

                <li className="nav-item mb-2">
                  <a
                    href="#title"
                    className="nav-link p-0 text-white-50"
                  >
                    Home
                  </a>
                </li>

                <li className="nav-item mb-2">
                  <a
                    href="#features"
                    className="nav-link p-0 text-white-50"
                  >
                    Features
                  </a>
                </li>

                <li className="nav-item mb-2">
                  <a
                    href="#pricing"
                    className="nav-link p-0 text-white-50"
                  >
                    Pricing
                  </a>
                </li>

              </ul>
            </div>

            <div className="col mb-3">
              <h5>Account</h5>

              <ul className="nav flex-column">

                <li className="nav-item mb-2">
                  <a
                    href="/register"
                    className="nav-link p-0 text-white-50"
                  >
                    Create Account
                  </a>
                </li>

                <li className="nav-item mb-2">
                  <a
                    href="/login"
                    className="nav-link p-0 text-white-50"
                  >
                    Login
                  </a>
                </li>

              </ul>
            </div>

            <div className="col mb-3">
              <h5>About</h5>

              <p className="text-white-50">
                A full-stack real-time chat application built with
                modern web technologies.
              </p>
            </div>

          </footer>

        </div>

      </section>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
         />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
         />

      </Routes>
    </BrowserRouter>
  );
}

export default App;