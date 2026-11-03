# ChatSpace 💬

A Full-Stack Real-Time Private Messaging Application

ChatSpace is a web-based messaging application that allows registered users to find other users and communicate through private one-to-one conversations in real time.

## Features

- User registration and email verification
- Secure login using JWT authentication
- Password hashing using bcrypt
- Search registered users by email
- Private one-to-one conversations
- Real-time messaging using Socket.IO
- Message storage using MongoDB Atlas
- Protected backend routes

## Tech Stack

- **Frontend:** React.js, Vite, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Real-Time Communication:** Socket.IO
- **Authentication:** JWT, bcrypt
- **Tools:** Git, GitHub, VS Code, Postman

## Project Structure

```text
ChatSpace/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   └── public/
├── package.json
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ananya20361/ChatSpace.git
```

### 2. Open the project folder

```bash
cd ChatSpace
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` folder and add the environment variables required by the application.

Configure your MongoDB connection string, JWT secret, and email service credentials using the variable names expected by your backend code.

**Important:** Never upload your `.env` file or expose your credentials publicly.

### 5. Start the backend

Run the start command defined in `backend/package.json`.

### 6. Install frontend dependencies

Open another terminal in the project folder and run:

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## Author

**Ananya Negi**

GitHub: [Ananya20361](https://github.com/Ananya20361)

---

If you find this project interesting, feel free to star the repository!
