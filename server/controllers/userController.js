import User from "../models/User.js";

export async function listUsers(_req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((user) => user.toPublic()));
  } catch (error) { next(error); }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!["admin", "doctor", "patient"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toPublic());
  } catch (error) { next(error); }
}
