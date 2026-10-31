import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { apiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { onQueueUpdate } from "../lib/socket.js";
import StatusPill from "../components/StatusPill.jsx";
import { todayISO, estimatedWaitMinutes, formatMinutes, peopleAhead } from "../lib/queue.js";

export default function MyQueue() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [queues, setQueues] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get("/appointments/mine");
      setAppointments(data);
    } catch (err) {
      console.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueFor = async (doctorId, date) => {
    try {
      const { data } = await api.get(`/appointments/queue/${doctorId}?date=${date}`);
      setQueues((prev) => ({ ...prev, [`${doctorId}-${date}`]: data }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAppointments();
    const unsub = onQueueUpdate(fetchAppointments);
    return unsub;
  }, []);

  useEffect(() => {
    appointments.forEach((a) => {
      fetchQueueFor(a.doctorId._id, a.visitDate);
    });
  }, [appointments]);

  const cancel = async (id) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: "cancelled" });
      fetchAppointments();
    } catch (err) {
      alert(apiError(err));
    }
  };

  const imHere = async (id) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: "in_progress" });
      fetchAppointments();
    } catch (err) {
      alert(apiError(err));
    }
  };

  if (loading) return <div className="loading">Loading your queue…</div>;

  const active = appointments.filter((a) => ["waiting", "called", "in_progress"].includes(a.status));
  const history = appointments.filter((a) => !["waiting", "called", "in_progress"].includes(a.status));

  return (
    <div className="page">
      <div className="container">
        <h1>My queue</h1>

        {active.length === 0 ? (
          <div className="card empty">
            <h3>No active appointments</h3>
            <p>
              <Link to="/hospitals">Browse hospitals</Link> to book your first appointment.
            </p>
          </div>
        ) : (
          <div className="token-grid">
            {active.map((a) => {
              const queue = queues[`${a.doctorId._id}-${a.visitDate}`] || [];
              const ahead = peopleAhead(queue, a._id);
              const wait = estimatedWaitMinutes(ahead + 1, a.doctorId.avgConsultMinutes);
              const isToday = a.visitDate === todayISO();

              return (
                <div className="card token-card" key={a._id}>
                  <div className="token-header">
                    <div>
                      <h2>Token #{a.tokenNumber}</h2>
                      <p className="text-muted">{a.visitDate}</p>
                    </div>
                    <StatusPill status={a.status} />
                  </div>
                  <p className="doctor-name">{a.doctorId.fullName}</p>
                  <p className="text-muted small">
                    {a.doctorId.specialty} · {a.hospitalId?.name}
                    {a.doctorId.room ? ` · Room ${a.doctorId.room}` : ""}
                  </p>
                  {isToday && (
                    <div className="wait-row">
                      <span>{ahead} ahead of you</span>
                      <span className="text-primary">{formatMinutes(wait)}</span>
                    </div>
                  )}
                  <div className="token-actions">
                    {a.status === "called" && (
                      <button className="btn btn-primary" onClick={() => imHere(a._id)}>
                        I’m here
                      </button>
                    )}
                    {a.status !== "cancelled" && (
                      <button className="btn btn-ghost" onClick={() => cancel(a._id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {history.length > 0 && (
          <>
            <h2 className="section-title">History</h2>
            <div className="history-list">
              {history.map((a) => (
                <div className="card history-card" key={a._id}>
                  <div>
                    <p className="doctor-name">{a.doctorId.fullName}</p>
                    <p className="text-muted small">{a.visitDate}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
