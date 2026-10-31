export function broadcastQueue(req, doctorId) {
  const io = req.app.get("io");
  io?.emit("queue:update");
  if (doctorId) io?.to(`doctor:${doctorId}`).emit("queue:update");
}

export function broadcastDoctors(req) {
  req.app.get("io")?.emit("doctors:update");
}

export function broadcastHospitals(req) {
  req.app.get("io")?.emit("hospitals:update");
}
