import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import { broadcastDoctors } from "../utils/broadcast.js";

export async function listDoctors(req, res, next) {
  try {
    const filter = req.query.hospitalId ? { hospitalId: req.query.hospitalId } : {};
    res.json(await Doctor.find(filter).sort({ fullName: 1 }).populate("hospitalId", "name"));
  } catch (error) { next(error); }
}

export async function getMyDoctorProfile(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate("hospitalId");
    if (!doctor) return res.status(404).json({ message: "No doctor profile linked" });
    res.json(doctor);
  } catch (error) { next(error); }
}

export async function createDoctor(req, res, next) {
  try {
    const { hospitalId, userId, fullName, specialty, room, avgConsultMinutes, isActive } = req.body;
    if (!hospitalId || !fullName || !specialty) return res.status(400).json({ message: "Hospital, full name and specialty are required" });
    if (!(await Hospital.findById(hospitalId))) return res.status(404).json({ message: "Hospital not found" });
    const doctor = await Doctor.create({ hospitalId, userId: userId || null, fullName: fullName.trim(), specialty: specialty.trim(), room: room || "", avgConsultMinutes: avgConsultMinutes || 10, isActive: isActive ?? true });
    if (userId) await User.findByIdAndUpdate(userId, { role: "doctor" });
    broadcastDoctors(req);
    res.status(201).json(await Doctor.findById(doctor._id).populate("hospitalId"));
  } catch (error) { next(error); }
}

export async function updateDoctor(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const fields = ["isActive", "fullName", "specialty", "room", "avgConsultMinutes"];
    for (const field of fields) if (req.body[field] !== undefined) doctor[field] = req.body[field];
    if (req.body.userId !== undefined) {
      doctor.userId = req.body.userId || null;
      if (req.body.userId) await User.findByIdAndUpdate(req.body.userId, { role: "doctor" });
    }
    await doctor.save();
    broadcastDoctors(req);
    res.json(await Doctor.findById(doctor._id).populate("hospitalId"));
  } catch (error) { next(error); }
}

export async function deleteDoctor(req, res, next) {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    broadcastDoctors(req);
    res.json({ ok: true });
  } catch (error) { next(error); }
}
