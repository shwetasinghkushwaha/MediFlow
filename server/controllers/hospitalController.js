import Hospital from "../models/Hospital.js";
import { broadcastHospitals } from "../utils/broadcast.js";

export async function listHospitals(_req, res, next) {
  try { res.json(await Hospital.find().sort({ name: 1 })); } catch (error) { next(error); }
}

export async function createHospital(req, res, next) {
  try {
    const { name, address, city, phone } = req.body;
    if (!name) return res.status(400).json({ message: "Hospital name is required" });
    const hospital = await Hospital.create({ name: name.trim(), address: address || "", city: city || "", phone: phone || "" });
    broadcastHospitals(req);
    res.status(201).json(hospital);
  } catch (error) { next(error); }
}

export async function deleteHospital(req, res, next) {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    broadcastHospitals(req);
    res.json({ ok: true });
  } catch (error) { next(error); }
}
