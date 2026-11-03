import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./Chat.css";

function Chat() {
    const [searchText, setSearchText] = useState("");

    const [socket, setSocket] = useState(null);

    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");

    // ================= SOCKET CONNECTION =================
    useEffect(() => {
        const newSocket = io("http://localhost:5000");

        newSocket.on("connect", () => {
            console.log(
                "Socket connected successfully:",
                newSocket.id
            );

            const loggedInUser = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            const currentUserId =
                loggedInUser?._id || loggedInUser?.id;

            if (currentUserId) {
                newSocket.emit("registerUser", currentUserId);
                console.log(
                    "Socket registered for user:",
                    currentUserId
                );
            }
        });

        newSocket.on("connect_error", (error) => {
            console.error(
                "Socket connection error:",
                error.message
            );
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // ================= RECEIVE REALTIME MESSAGES =================
    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleNewMessage = (message) => {
            console.log(
                "New realtime message received:",
                message
            );

            setMessages((previousMessages) => [
                ...previousMessages,
                message
            ]);
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket]);

    // ================= SEARCH USER =================
    const searchUser = async () => {
        try {
            setError("");
            setUser(null);
            setConversation(null);
            setMessages([]);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login first.");
                return;
            }

            if (!searchText.trim()) {
                setError("Enter a name or email to search.");
                return;
            }

            setSearching(true);

            const response = await fetch(
                `http://localhost:5000/api/users/search?email=${encodeURIComponent(
                    searchText.trim()
                )}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "No user found.");
                return;
            }

            const loggedInUser = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            const currentUserId =
                loggedInUser?._id || loggedInUser?.id;

            if (
                currentUserId &&
                data.user?._id &&
                data.user._id.toString() === currentUserId.toString()
            ) {
                setError("You cannot message yourself.");
                return;
            }

            setUser(data.user);
        } catch (error) {
            console.error(error);
            setError("Unable to connect to the server.");
        } finally {
            setSearching(false);
        }
    };

    // ================= LOAD OLD MESSAGES =================
    const loadMessages = async (conversationId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/messages/${conversationId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Failed to load messages:",
                    data.message
                );
                return;
            }

            setMessages(data.messages);

            console.log(
                "Messages loaded:",
                data.messages
            );
        } catch (error) {
            console.error(
                "Load messages error:",
                error
            );
        }
    };

    // ================= JOIN CONVERSATION ROOM =================
    const joinConversation = (conversationId) => {
        if (!socket) {
            console.log(
                "Socket is not connected yet."
            );
            return;
        }

        socket.emit(
            "joinConversation",
            conversationId
        );

        console.log(
            "Joined conversation room:",
            conversationId
        );
    };

    // ================= CREATE CONVERSATION =================
    const createConversation = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login first.");
                return;
            }

            if (!user?._id) {
                setError("Please select a user first.");
                return;
            }

            const loggedInUser = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            const currentUserId =
                loggedInUser?._id || loggedInUser?.id;

            if (
                currentUserId &&
                user._id.toString() === currentUserId.toString()
            ) {
                setError("You cannot message yourself.");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/conversations",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: user._id,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            setConversation(data.conversation);

            console.log(
                "Conversation created:",
                data.conversation
            );

            await loadMessages(
                data.conversation._id
            );

            joinConversation(
                data.conversation._id
            );
        } catch (error) {
            console.error(
                "Create conversation error:",
                error
            );
        }
    };

    const loggedInUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    // ================= SEND MESSAGE =================
    const sendMessage = () => {
        const currentUserId =
            loggedInUser?._id || loggedInUser?.id;

        if (!socket) {
            console.log("Socket is not connected yet.");
            return;
        }

        if (!conversation?._id) {
            console.log("No conversation selected.");
            return;
        }

        if (!currentUserId) {
            console.log("Logged-in user ID not found.");
            return;
        }

        const text = messageText.trim();

        if (!text) {
            return;
        }

        socket.emit("sendMessage", {
            conversationId: conversation._id,
            sender: currentUserId,
            text: text
        });

        setMessageText("");
    };

    // ================= LOGOUT =================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <div className="chat-app">

            {/* ================= SIDEBAR ================= */}
            <aside className="chat-sidebar">

                {/* BRAND */}
                <div className="sidebar-header">
                    <div className="chatspace-logo">
                        💬
                    </div>

                    <div>
                        <h2>ChatSpace</h2>
                        <span>Messages</span>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="chat-search-wrapper">

                    <div className="chat-search">

                        <span className="search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search people..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(
                                    e.target.value
                                );
                                setError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchUser();
                                }
                            }}
                        />

                        {searchText && (
                            <button
                                className="clear-search"
                                onClick={() => {
                                    setSearchText("");
                                    setUser(null);
                                    setConversation(null);
                                    setMessages([]);
                                    setError("");
                                }}
                            >
                                ×
                            </button>
                        )}

                    </div>

                    <button
                        className="search-button"
                        onClick={searchUser}
                        disabled={searching}
                    >
                        {searching
                            ? "Searching..."
                            : "Search"}
                    </button>

                </div>

                {/* SEARCH RESULT */}
                {user && (
                    <div className="people-section">

                        <div className="section-title">
                            <span>
                                SEARCH RESULT
                            </span>
                        </div>

                        <div className="person-card">

                            <div className="person-avatar">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}

                                <span className="online-dot"></span>
                            </div>

                            <div className="person-info">
                                <h3>{user.name}</h3>

                                <p>
                                    {user.email}
                                </p>

                                <span className="person-status">
                                    ● Available to chat
                                </span>
                            </div>

                            <button
                                className="message-person-btn"
                                title="Start conversation"
                                onClick={createConversation}
                            >
                                →
                            </button>

                        </div>

                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="search-error">
                        <span>⚠</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* RECENT CHATS PLACEHOLDER */}
                {!user && !error && (
                    <div className="recent-section">

                        <div className="section-title">
                            <span>
                                YOUR CHATS
                            </span>
                        </div>

                        <div className="no-chats">

                            <div className="no-chats-icon">
                                💬
                            </div>

                            <h3>
                                No conversations yet
                            </h3>

                            <p>
                                Search for someone above
                                to start a private
                                conversation.
                            </p>

                        </div>

                    </div>
                )}

                {/* SIDEBAR BOTTOM */}
                <div className="sidebar-bottom">

                    <div className="logged-user">

                        <div className="logged-avatar">
                            {loggedInUser?.name
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                        </div>

                        <div className="logged-info">

                            <strong>
                                {loggedInUser?.name ||
                                    "User"}
                            </strong>

                            <span>
                                <i></i> Online
                            </span>

                        </div>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            ↪
                        </button>

                    </div>

                </div>

            </aside>

            {/* ================= MAIN CHAT AREA ================= */}
            <main className="chat-content">

                {/* TOP BAR */}
                <header className="conversation-header">

                    <div className="header-brand-mobile">
                        💬 ChatSpace
                    </div>

                    {user ? (
                        <div className="selected-user">

                            <div className="selected-avatar">

                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}

                                <span></span>

                            </div>

                            <div>

                                <h2>
                                    {user.name}
                                </h2>

                                <p>
                                    <span className="header-online-dot"></span>
                                    Available to chat
                                </p>

                            </div>

                        </div>
                    ) : (
                        <div className="conversation-placeholder-header">

                            <span>💬</span>

                            <div>

                                <h2>
                                    ChatSpace
                                </h2>

                                <p>
                                    Your private messaging
                                    space
                                </p>

                            </div>

                        </div>
                    )}

                    <div className="header-actions">

                        <button title="Search">
                            ⌕
                        </button>

                        <button title="More options">
                            ⋮
                        </button>

                    </div>

                </header>

                {/* ================= CHAT BODY ================= */}
                <section className="conversation-body">

                    {!user ? (
                        <div className="welcome-chat">

                            <div className="welcome-chat-icon">
                                <div>💬</div>
                            </div>

                            <h1>
                                Welcome to ChatSpace
                            </h1>

                            <p>
                                Connect with your friends
                                and start private
                                conversations.
                            </p>

                            <div className="welcome-features">

                                <div>
                                    <span>🔒</span>
                                    <p>Private chats</p>
                                </div>

                                <div>
                                    <span>⚡</span>
                                    <p>Realtime messages</p>
                                </div>

                                <div>
                                    <span>🛡️</span>
                                    <p>Secure accounts</p>
                                </div>

                            </div>

                            <div className="welcome-search-hint">
                                <span>⌕</span>
                                Search for someone from
                                the left panel
                            </div>

                        </div>
                    ) : conversation ? (
                        <div className="messages-container">

                            {messages.length === 0 ? (
                                <div className="empty-conversation">

                                    <div className="conversation-avatar-large">
                                        {user.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <h2>
                                        {user.name}
                                    </h2>

                                    <p>
                                        No messages yet.
                                    </p>

                                    <p className="conversation-subtext">
                                        Send a message to
                                        start the
                                        conversation.
                                    </p>

                                </div>
                            ) : (
                                messages.map(
                                    (message) => {

                                        const currentUserId =
                                            loggedInUser?._id ||
                                            loggedInUser?.id;

                                        const senderId =
                                            message.sender?._id ||
                                            message.sender;

                                        const isMine =
                                            senderId?.toString() ===
                                            currentUserId?.toString();

                                        return (
                                            <div
                                                key={
                                                    message._id
                                                }
                                                className={
                                                    isMine
                                                        ? "message-row my-message"
                                                        : "message-row other-message"
                                                }
                                            >
                                                <div className="message-bubble">

                                                    <p>
                                                        {message.text}
                                                    </p>

                                                    <span>
                                                        {message.createdAt
                                                            ? new Date(
                                                                  message.createdAt
                                                              ).toLocaleTimeString(
                                                                  [],
                                                                  {
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  }
                                                              )
                                                            : ""}
                                                    </span>

                                                </div>
                                            </div>
                                        );
                                    }
                                )
                            )}

                        </div>
                    ) : (
                        <div className="empty-conversation">

                            <div className="conversation-avatar-large">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <h2>
                                {user.name}
                            </h2>

                            <p>
                                You found{" "}
                                <strong>
                                    {user.name}
                                </strong>.
                            </p>

                            <p className="conversation-subtext">
                                Start a private
                                conversation with this
                                user.
                            </p>

                            <button
                                className="start-conversation-button"
                                onClick={
                                    createConversation
                                }
                            >
                                💬 Start Conversation
                            </button>

                        </div>
                    )}

                </section>

                {/* ================= MESSAGE INPUT ================= */}
                <footer className="message-composer">

                    <button
                        className="composer-icon"
                        title="Attach file"
                    >
                        ＋
                    </button>

                    <input
                        type="text"
                        placeholder={
                            conversation
                                ? `Message ${user?.name}...`
                                : "Select someone to start chatting..."
                        }
                        value={messageText}
                        onChange={(e) =>
                            setMessageText(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        disabled={!conversation}
                    />

                    <button
                        className="send-message-button"
                        onClick={sendMessage}
                        disabled={!conversation || !messageText.trim()}
                    >
                        ➤
                    </button>

                </footer>

            </main>

        </div>
    );
}

export default Chat;