import { Route, Routes } from "react-router-dom";
import RequireAuth from "../components/RequireAuth.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import Auth from "../pages/Auth.jsx";
import Book from "../pages/Book.jsx";
import DoctorDashboard from "../pages/DoctorDashboard.jsx";
import Home from "../pages/Home.jsx";
import Hospitals from "../pages/Hospitals.jsx";
import MyQueue from "../pages/MyQueue.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/hospitals" element={<Hospitals />} />
      <Route path="/book/:doctorId" element={<RequireAuth><Book /></RequireAuth>} />
      <Route path="/my-queue" element={<RequireAuth allowedRoles={["patient", "doctor", "admin"]}><MyQueue /></RequireAuth>} />
      <Route path="/doctor" element={<RequireAuth allowedRoles={["doctor", "admin"]}><DoctorDashboard /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth allowedRoles={["admin"]}><AdminDashboard /></RequireAuth>} />
      <Route path="*" element={<div className="page">Page not found</div>} />
    </Routes>
  );
}
