import { useEffect, useState } from "react";
import api, { apiError } from "../lib/api.js";
import { joinDoctorRoom, leaveDoctorRoom, onQueueUpdate } from "../lib/socket.js";
import StatusPill from "../components/StatusPill.jsx";
import { todayISO, estimatedWaitMinutes, formatMinutes } from "../lib/queue.js";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctor = async () => {
    try {
      const { data } = await api.get("/doctors/me");
      setDoctor(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    if (!doctor) return;
    try {
      const { data } = await api.get(`/appointments/queue/${doctor._id}?date=${todayISO()}`);
      setQueue(data);
    } catch (err) {
      console.error(apiError(err));
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  useEffect(() => {
    if (!doctor) return;
    fetchQueue();
    joinDoctorRoom(doctor._id);
    const unsub = onQueueUpdate(fetchQueue);
    return () => {
      leaveDoctorRoom(doctor._id);
      unsub();
    };
  }, [doctor]);

  const callNext = async () => {
    try {
      await api.post(`/appointments/next/${doctor._id}`, { date: todayISO() });
      fetchQueue();
    } catch (err) {
      alert(apiError(err));
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchQueue();
    } catch (err) {
      alert(apiError(err));
    }
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="card empty">
            <h3>Not linked to a doctor profile</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const current = queue.find((a) => a.status === "in_progress");
  const called = queue.find((a) => a.status === "called");
  const waiting = queue.filter((a) => a.status === "waiting");
  const completed = queue.filter((a) => a.status === "completed");

  return (
    <div className="page">
      <div className="container">
        <h1>Doctor dashboard</h1>
        <p className="text-muted">
          {doctor.fullName} · {doctor.specialty} · {doctor.hospitalId?.name}
        </p>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-label">Waiting</span>
            <span className="stat-value">{waiting.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completed.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Next token</span>
            <span className="stat-value">
              {waiting[0] ? `#${waiting[0].tokenNumber}` : "—"}
            </span>
          </div>
        </div>

        {current ? (
          <div className="card current-card">
            <h2>Current patient</h2>
            <div className="current-row">
              <div>
                <p className="doctor-name">Token #{current.tokenNumber} — {current.patientName}</p>
                <p className="text-muted small">{current.reason || "No reason given"}</p>
                <p className="text-muted small">{current.patientPhone}</p>
              </div>
              <StatusPill status={current.status} />
            </div>
            <button className="btn btn-primary" onClick={() => setStatus(current._id, "completed")}>
              Mark completed
            </button>
          </div>
        ) : called ? (
          <div className="card current-card">
            <h2>Patient called</h2>
            <div className="current-row">
              <div>
                <p className="doctor-name">Token #{called.tokenNumber} — {called.patientName}</p>
                <p className="text-muted small">{called.patientPhone}</p>
              </div>
              <StatusPill status={called.status} />
            </div>
            <button className="btn btn-primary" onClick={() => setStatus(called._id, "in_progress")}>
              Start consultation
            </button>
          </div>
        ) : (
          <div className="card empty">
            <h3>No patient in progress</h3>
            <button className="btn btn-primary" onClick={callNext}>
              Call next patient
            </button>
          </div>
        )}

        <h2 className="section-title">Today’s queue</h2>
        {queue.length === 0 ? (
          <p className="text-muted">No appointments today.</p>
        ) : (
          <div className="queue-list">
            {queue.map((a, idx) => {
              const wait = estimatedWaitMinutes(idx + 1, doctor.avgConsultMinutes);
              return (
                <div className="card queue-row" key={a._id}>
                  <div className="queue-info">
                    <span className="token">#{a.tokenNumber}</span>
                    <div>
                      <p className="doctor-name">{a.patientName}</p>
                      <p className="text-muted small">{a.reason || "No reason"} · {a.patientPhone}</p>
                    </div>
                  </div>
                  <div className="queue-actions">
                    <span className="text-muted small">{formatMinutes(wait)}</span>
                    <StatusPill status={a.status} />
                    {a.status === "waiting" && (
                      <>
                        <button className="btn btn-sm" onClick={() => setStatus(a._id, "called")}>
                          Call
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setStatus(a._id, "skipped")}>
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
