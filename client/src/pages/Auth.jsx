import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (mode === "register") {
      if (!fullName || !email || !password) {
        setMessage("Please fill in all required fields");
        return;
      }
      if (password.length < 8) {
        setMessage("Password must be at least 8 characters");
        return;
      }
      const result = await register({ fullName, email, password, phone });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
    } else {
      if (!email || !password) {
        setMessage("Email and password are required");
        return;
      }
      const result = await login(email, password);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
    }

    navigate("/my-queue");
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="auth-sub">The first registered account becomes the admin automatically.</p>

        <div className="tabs">
          <button className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>
            Sign in
          </button>
          <button
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {mode === "register" && (
            <>
              <label>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <label>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </>
          )}
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {message && <p className="form-error">{message}</p>}
          <button type="submit" className="btn btn-primary w-full">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
