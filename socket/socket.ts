import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["POST", "DELETE", "PATCH", "GET"],
    credentials: true,
  },
});

const socketMap: { [key: string]: string } = {};

export function getReceiverSocketId(reciverId: string) {
  return socketMap[reciverId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    socketMap[userId] = socket.id;
  }

  io.emit("onlineUsers", Object.keys(socketMap));

  socket.on("disconnect", () => {
    if (socketMap[userId]) {
      delete socketMap[userId];

      io.emit("onlineUsers", Object.keys(socketMap));
    }
  });
});

export { app, io, server };
