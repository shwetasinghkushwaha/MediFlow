import { useEffect, useState } from "react";
import api, { apiError } from "../lib/api.js";
import { onDoctorsUpdate, onHospitalsUpdate, onQueueUpdate } from "../lib/socket.js";
import StatusPill from "../components/StatusPill.jsx";
import { todayISO, estimatedWaitMinutes, formatMinutes } from "../lib/queue.js";

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState({});
  const [loading, setLoading] = useState(true);

  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");

  const [doctorForm, setDoctorForm] = useState({
    hospitalId: "",
    userId: "",
    fullName: "",
    specialty: "",
    room: "",
    avgConsultMinutes: 10,
  });

  const fetchHospitals = async () => {
    const { data } = await api.get("/hospitals");
    setHospitals(data);
  };

  const fetchDoctors = async () => {
    const { data } = await api.get("/doctors");
    setDoctors(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  };

  const fetchQueues = async () => {
    const map = {};
    await Promise.all(
      doctors.map(async (d) => {
        try {
          const { data } = await api.get(`/appointments/queue/${d._id}?date=${todayISO()}`);
          map[d._id] = data;
        } catch {
          map[d._id] = [];
        }
      })
    );
    setQueues(map);
  };

  const refresh = async () => {
    await Promise.all([fetchHospitals(), fetchDoctors(), fetchUsers()]);
  };

  useEffect(() => {
    refresh().then(() => setLoading(false));
    const unsub1 = onHospitalsUpdate(refresh);
    const unsub2 = onDoctorsUpdate(refresh);
    const unsub3 = onQueueUpdate(refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  useEffect(() => {
    fetchQueues();
  }, [doctors]);

  const createHospital = async (e) => {
    e.preventDefault();
    try {
      await api.post("/hospitals", {
        name: hospitalName,
        city: hospitalCity,
        address: hospitalAddress,
      });
      setHospitalName("");
      setHospitalCity("");
      setHospitalAddress("");
      fetchHospitals();
    } catch (err) {
      alert(apiError(err));
    }
  };

  const createDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post("/doctors", doctorForm);
      setDoctorForm({
        hospitalId: "",
        userId: "",
        fullName: "",
        specialty: "",
        room: "",
        avgConsultMinutes: 10,
      });
      fetchDoctors();
    } catch (err) {
      alert(apiError(err));
    }
  };

  const toggleDoctor = async (id, isActive) => {
    try {
      await api.patch(`/doctors/${id}`, { isActive: !isActive });
      fetchDoctors();
    } catch (err) {
      alert(apiError(err));
    }
  };

  const removeDoctor = async (id) => {
    if (!confirm("Remove this doctor?")) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert(apiError(err));
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      fetchUsers();
    } catch (err) {
      alert(apiError(err));
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard…</div>;

  return (
    <div className="page">
      <div className="container">
        <h1>Admin dashboard</h1>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-label">Hospitals</span>
            <span className="stat-value">{hospitals.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Doctors</span>
            <span className="stat-value">{doctors.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </div>

        <div className="admin-grid">
          <div className="card">
            <h2>Add hospital</h2>
            <form onSubmit={createHospital} className="form-stack">
              <label>Name</label>
              <input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required />
              <label>City</label>
              <input value={hospitalCity} onChange={(e) => setHospitalCity(e.target.value)} />
              <label>Address</label>
              <input value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} />
              <button className="btn btn-primary w-full" type="submit">
                Add hospital
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Add doctor</h2>
            <form onSubmit={createDoctor} className="form-stack">
              <label>Full name</label>
              <input
                value={doctorForm.fullName}
                onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                required
              />
              <label>Specialty</label>
              <input
                value={doctorForm.specialty}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                required
              />
              <label>Hospital</label>
              <select
                value={doctorForm.hospitalId}
                onChange={(e) => setDoctorForm({ ...doctorForm, hospitalId: e.target.value })}
                required
              >
                <option value="">Select hospital</option>
                {hospitals.map((h) => (
                  <option value={h._id} key={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
              <label>Linked user (optional)</label>
              <select
                value={doctorForm.userId}
                onChange={(e) => setDoctorForm({ ...doctorForm, userId: e.target.value })}
              >
                <option value="">None</option>
                {users.map((u) => (
                  <option value={u._id} key={u._id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
              <label>Room</label>
              <input
                value={doctorForm.room}
                onChange={(e) => setDoctorForm({ ...doctorForm, room: e.target.value })}
              />
              <label>Avg consult (min)</label>
              <input
                type="number"
                min={1}
                value={doctorForm.avgConsultMinutes}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, avgConsultMinutes: Number(e.target.value) })
                }
              />
              <button className="btn btn-primary w-full" type="submit">
                Add doctor
              </button>
            </form>
          </div>
        </div>

        <h2 className="section-title">Doctors</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Hospital</th>
                <th>Queue today</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => {
                const q = queues[d._id] || [];
                const active = q.filter((a) => ["waiting", "called", "in_progress"].includes(a.status));
                const next = active[0];
                return (
                  <tr key={d._id}>
                    <td>{d.fullName}</td>
                    <td>{d.specialty}</td>
                    <td>{d.hospitalId?.name}</td>
                    <td>
                      {active.length} waiting
                      {next && <span className="text-muted small"> · next #{next.tokenNumber}</span>}
                    </td>
                    <td>
                      <span className={d.isActive ? "badge success" : "badge outline"}>
                        {d.isActive ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => toggleDoctor(d._id, d.isActive)}>
                        {d.isActive ? "Pause" : "Activate"}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeDoctor(d._id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="section-title">Users</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Change role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                      <option value="admin">admin</option>
                      <option value="doctor">doctor</option>
                      <option value="patient">patient</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="section-title">Live queues</h2>
        <div className="live-queues">
          {doctors.map((d) => {
            const q = queues[d._id] || [];
            const active = q.filter((a) => ["waiting", "called", "in_progress"].includes(a.status));
            return (
              <div className="card queue-preview" key={d._id}>
                <h3>{d.fullName}</h3>
                <p className="text-muted small">
                  {d.specialty} · {d.hospitalId?.name}
                </p>
                {active.length === 0 ? (
                  <p className="text-muted small">No active patients</p>
                ) : (
                  <ul className="preview-list">
                    {active.slice(0, 5).map((a, idx) => (
                      <li key={a._id}>
                        <span>#{a.tokenNumber}</span>
                        <span>{a.patientName}</span>
                        <StatusPill status={a.status} />
                        <span className="text-muted small">
                          {formatMinutes(estimatedWaitMinutes(idx + 1, d.avgConsultMinutes))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
