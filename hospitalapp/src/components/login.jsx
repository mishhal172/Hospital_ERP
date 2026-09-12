import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/login/",
                {
                    username,
                    password,
                }
            );
            console.log(response.data);

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh",response.data.refresh);
            localStorage.setItem("role",response.data.role);
            localStorage.setItem("username",response.data.username);
            localStorage.setItem("doctor_name", response.data.full_name || response.data.user?.full_name);

            const role = response.data.role;
            console.log(role)
            if (role === "admin") {

                navigate("/admin");

            }

            else if (role === "doctor") {

                navigate("/doctor");

            }

            else if (role === "receptionist") {

                navigate("/reception");

            }
            else if (role === "pharmacist") {

                navigate("/pharmacist");

            }

            else {

                alert("No dashboard assigned");

            }

        } catch (error) {

            alert("Invalid username or password");

            console.log(error);

        }
    };

    return (

        <div className="login-container">

            <form
                className="login-form"
                onSubmit={handleLogin}
            >

                <h1>Hospital ERP</h1>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;