import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { broadcastQueue } from "../utils/broadcast.js";

export async function getDoctorQueue(req, res, next) {
  try {
    const visitDate = req.query.date || new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.find({ doctorId: req.params.doctorId, visitDate }).sort({ tokenNumber: 1 }).populate("doctorId", "fullName specialty avgConsultMinutes").populate("hospitalId", "name");
    res.json(appointments);
  } catch (error) { next(error); }
}

export async function getMyAppointments(req, res, next) {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id }).sort({ visitDate: -1, tokenNumber: -1 }).populate("doctorId", "fullName specialty room avgConsultMinutes").populate("hospitalId", "name city");
    res.json(appointments);
  } catch (error) { next(error); }
}

export async function createAppointment(req, res, next) {
  try {
    const { doctorId, patientName, patientPhone, reason, visitDate } = req.body;
    if (!doctorId || !patientName || !visitDate) return res.status(400).json({ message: "Doctor, patient name and visit date are required" });
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (!doctor.isActive) return res.status(400).json({ message: "Doctor is not accepting bookings" });
    const appointment = await Appointment.create({ doctorId, hospitalId: doctor.hospitalId, patientId: req.user._id, patientName: patientName.trim(), patientPhone: patientPhone || "", reason: reason || "", visitDate, status: "waiting" });
    broadcastQueue(req, doctorId);
    res.status(201).json(await Appointment.findById(appointment._id).populate("doctorId", "fullName specialty room avgConsultMinutes").populate("hospitalId", "name city"));
  } catch (error) { next(error); }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    const linkedDoctor = await Doctor.findOne({ userId: req.user._id });
    const isAdmin = req.user.role === "admin";
    const isDoctor = linkedDoctor?._id.toString() === appointment.doctorId.toString();
    const isOwner = appointment.patientId?.toString() === req.user._id.toString();
    if (status === "cancelled" ? !isAdmin && !isDoctor && !isOwner : !isAdmin && !isDoctor) return res.status(403).json({ message: "Not allowed to update status" });
    appointment.status = status;
    if (status === "called") appointment.calledAt = new Date();
    if (status === "completed") appointment.completedAt = new Date();
    await appointment.save();
    broadcastQueue(req, appointment.doctorId.toString());
    res.json(await Appointment.findById(appointment._id).populate("doctorId", "fullName specialty room avgConsultMinutes").populate("hospitalId", "name city"));
  } catch (error) { next(error); }
}

export async function callNextPatient(req, res, next) {
  try {
    const { doctorId } = req.params;
    const visitDate = req.body.date || new Date().toISOString().slice(0, 10);
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const linked = await Doctor.findOne({ userId: req.user._id });
    if (req.user.role !== "admin" && linked?._id.toString() !== doctorId) return res.status(403).json({ message: "Not allowed" });
    const current = await Appointment.findOne({ doctorId, visitDate, status: "in_progress" });
    if (current) { current.status = "completed"; current.completedAt = new Date(); await current.save(); }
    const called = await Appointment.findOne({ doctorId, visitDate, status: "called" });
    if (called) { called.status = "in_progress"; await called.save(); }
    const waiting = await Appointment.findOne({ doctorId, visitDate, status: "waiting" }).sort({ tokenNumber: 1 });
    if (waiting) { waiting.status = "called"; waiting.calledAt = new Date(); await waiting.save(); }
    broadcastQueue(req, doctorId);
    res.json({ ok: true });
  } catch (error) { next(error); }
}
