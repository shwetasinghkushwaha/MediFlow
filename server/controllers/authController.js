import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: "Full name, email and password are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "Email already registered" });
    const role = (await User.countDocuments()) === 0 ? "admin" : "patient";
    const user = await User.create({ fullName: fullName.trim(), email: normalizedEmail, password, phone: phone || "", role });
    res.status(201).json({ user: user.toPublic(), token: signToken(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ user: user.toPublic(), token: signToken(user) });
  } catch (error) { next(error); }
}

export function getCurrentUser(req, res) {
  res.json({ user: req.user.toPublic() });
}
