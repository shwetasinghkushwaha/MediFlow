import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io({
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function onQueueUpdate(cb) {
  const s = getSocket();
  s.on("queue:update", cb);
  return () => s.off("queue:update", cb);
}

export function onDoctorsUpdate(cb) {
  const s = getSocket();
  s.on("doctors:update", cb);
  return () => s.off("doctors:update", cb);
}

export function onHospitalsUpdate(cb) {
  const s = getSocket();
  s.on("hospitals:update", cb);
  return () => s.off("hospitals:update", cb);
}

export function joinDoctorRoom(doctorId) {
  getSocket().emit("queue:join", doctorId);
}

export function leaveDoctorRoom(doctorId) {
  getSocket().emit("queue:leave", doctorId);
}
