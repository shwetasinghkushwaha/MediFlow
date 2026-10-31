import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { onDoctorsUpdate, onHospitalsUpdate } from "../lib/socket.js";

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [{ data: h }, { data: d }] = await Promise.all([
      api.get("/hospitals"),
      api.get("/doctors"),
    ]);
    setHospitals(h);
    setDoctors(d);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const unsub1 = onHospitalsUpdate(fetchAll);
    const unsub2 = onDoctorsUpdate(fetchAll);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const term = query.trim().toLowerCase();
  const filtered = hospitals.filter((h) => {
    if (!term) return true;
    const doctorMatch = doctors.some(
      (d) =>
        d.hospitalId?._id === h._id &&
        (d.fullName.toLowerCase().includes(term) || d.specialty.toLowerCase().includes(term))
    );
    return (
      h.name.toLowerCase().includes(term) ||
      (h.city || "").toLowerCase().includes(term) ||
      doctorMatch
    );
  });

  if (loading) return <div className="loading">Loading hospitals…</div>;

  return (
    <div className="page">
      <div className="container">
        <h1>Hospitals & doctors</h1>
        <p className="text-muted">Pick a doctor to join their live queue.</p>

        <input
          className="search-input"
          placeholder="Search hospital, city or specialty"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div className="card empty">
            <h3>Nothing here yet</h3>
            <p>Hospitals and doctors are added by an administrator.</p>
          </div>
        ) : (
          <div className="hospital-list">
            {filtered.map((h) => {
              const docs = doctors.filter((d) => d.hospitalId?._id === h._id);
              return (
                <div className="card hospital-card" key={h._id}>
                  <div className="hospital-header">
                    <div>
                      <h2>{h.name}</h2>
                      <p className="text-muted">
                        {[h.address, h.city].filter(Boolean).join(", ") || "Address not listed"}
                      </p>
                    </div>
                    <span className="badge">{docs.length} doctors</span>
                  </div>
                  <div className="doctor-list">
                    {docs.length === 0 ? (
                      <p className="text-muted">No doctors listed yet.</p>
                    ) : (
                      docs.map((d) => (
                        <div className="doctor-row" key={d._id}>
                          <div>
                            <p className="doctor-name">{d.fullName}</p>
                            <p className="text-muted small">
                              {d.specialty}
                              {d.room ? ` · Room ${d.room}` : ""} · {d.avgConsultMinutes} min avg
                            </p>
                          </div>
                          {d.isActive ? (
                            <Link to={`/book/${d._id}`} className="btn btn-primary btn-sm">
                              Book
                            </Link>
                          ) : (
                            <span className="badge outline">Paused</span>
                          )}
                        </div>
                      ))
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
