import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { apiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { todayISO, estimatedWaitMinutes, formatMinutes } from "../lib/queue.js";
import { onQueueUpdate } from "../lib/socket.js";

export default function Book() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [visitDate, setVisitDate] = useState(todayISO());
  const [queueSize, setQueueSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.fullName && !name) setName(user.fullName);
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user, name, phone]);

  const fetchDoctor = async () => {
    try {
      const { data } = await api.get(`/doctors`);
      const d = data.find((x) => x._id === doctorId);
      if (!d) throw new Error("Doctor not found");
      setDoctor(d);
      setHospital(d.hospitalId);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueSize = async () => {
    try {
      const { data } = await api.get(`/appointments/queue/${doctorId}?date=${visitDate}`);
      const active = data.filter((a) => ["waiting", "called", "in_progress"].includes(a.status));
      setQueueSize(active.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!doctor) return;
    fetchQueueSize();
    const unsub = onQueueUpdate(fetchQueueSize);
    return unsub;
  }, [doctor, visitDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the patient name");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/appointments", {
        doctorId,
        patientName: name.trim(),
        patientPhone: phone.trim(),
        reason: reason.trim(),
        visitDate,
      });
      navigate("/my-queue");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (!doctor) return <div className="page"><div className="container"><p className="form-error">{error || "Doctor not found"}</p></div></div>;

  const wait = estimatedWaitMinutes(queueSize + 1, doctor.avgConsultMinutes);

  return (
    <div className="page">
      <div className="container narrow">
        <h1>Book appointment</h1>
        <p className="text-muted">
          {doctor.fullName} · {doctor.specialty}
          {hospital ? ` · ${hospital.name}` : ""}
          {doctor.room ? ` · Room ${doctor.room}` : ""}
        </p>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-label">In queue now</span>
            <span className="stat-value">{queueSize}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Your est. wait</span>
            <span className="stat-value text-primary">{formatMinutes(wait)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card form-card">
          <h2>Patient details</h2>
          <p className="text-muted">A token number is assigned automatically once you confirm.</p>

          <div className="form-grid">
            <div>
              <label>Patient name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <label>Visit date</label>
          <input
            type="date"
            min={todayISO()}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
          <label>Reason for visit</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms"
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
