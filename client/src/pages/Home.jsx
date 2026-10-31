import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-content">
          <h1>Skip the waiting-room guesswork</h1>
          <p>
            QueueCare gives patients a live token, an estimated wait time, and real-time queue
            updates. Doctors and admins manage queues from one clean dashboard.
          </p>
          <div className="hero-actions">
            <Link to="/hospitals" className="btn btn-primary">
              Find a doctor
            </Link>
            {!user && (
              <Link to="/auth" className="btn btn-secondary">
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Built for every role</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>For patients</h3>
              <p>Browse hospitals, book a doctor, get your token number, and track your wait live.</p>
            </div>
            <div className="feature-card">
              <h3>For doctors</h3>
              <p>See today’s queue, call the next patient, start and complete consultations.</p>
            </div>
            <div className="feature-card">
              <h3>For admins</h3>
              <p>Add hospitals and doctors, manage users, and monitor queues across the board.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
