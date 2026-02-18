import { useState } from "react";
import Card from "../components/Card";
import "../styles/login.css";
import logo from "../assets/logo.png";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // ✅ import icons

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        alert("Login Successful!");
        localStorage.setItem("token", response.data.token);
        window.location.href = "/dashboard";
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="login">
      <Card className="left-card">
        <h2>HEALTHCARE</h2>
        <p>All your healthcare needs on your fingertips</p>
      </Card>

      <Card className="right-card">
        <img src={logo} alt="Logo" className="logo" />

        <h2>Welcome User</h2>
        <p className="subtitle">Sign in to continue</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password field with eye icon */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </span>
        </div>

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <div className="forgot">Forgot Password?</div>

        <button className="login-btn" onClick={handleLogin}>
          SIGN IN
        </button>
      </Card>
    </div>
  );
}
