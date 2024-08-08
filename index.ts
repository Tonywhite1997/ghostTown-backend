import express, { Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user";
import authRoute from "./routes/auth";
import chatRoute from "./routes/chat";
import messageRoute from "./routes/message";
import { app, server } from "./socket/socket";

dotenv.config();

const PORT: number = 5000;

app.use(express.json(), cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.all("*", (req: Request, res: Response) => {
  const endpoint: string = req.originalUrl;
  const message: string = `${endpoint} not found`;

  res.status(400).json({
    message,
  });
});

server.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
