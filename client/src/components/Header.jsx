import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">QC</span>
          <span className="brand-name">QueueCare</span>
        </Link>
        <nav className="nav">
          <Link to="/hospitals">Hospitals</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          {(user?.role === "doctor" || user?.role === "admin") && <Link to="/doctor">Doctor</Link>}
          {user && <Link to="/my-queue">My Queue</Link>}
          {user ? (
            <button className="btn btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
