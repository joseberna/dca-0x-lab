import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocketServer = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // 🔥 Permitir conexiones desde frontend local o remoto
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

// Export para usar en controladores y servicios
export { io };
