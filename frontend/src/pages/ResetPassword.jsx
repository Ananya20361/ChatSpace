
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/auth/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Something went wrong");
                return;
            }

            setMessage("Password reset successfully! You can now login.");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error(error);
            setError("Unable to connect to server");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">

                    <div className="card p-4 shadow">

                        <h2 className="text-center mb-4">
                            Reset Password
                        </h2>

                        <form onSubmit={handleResetPassword}>

                            <div className="mb-3">
                                <label className="form-label">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div className="alert alert-success">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                            >
                                Reset Password
                            </button>

                        </form>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default ResetPassword;

