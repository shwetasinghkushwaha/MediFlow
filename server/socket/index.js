import { Server } from "socket.io";

export function createSocketServer(httpServer, clientOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: clientOrigin, credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("queue:join", (doctorId) => socket.join(`doctor:${doctorId}`));
    socket.on("queue:leave", (doctorId) => socket.leave(`doctor:${doctorId}`));
  });

  return io;
}
