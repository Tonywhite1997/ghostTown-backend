import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user";
import authRoute from "./routes/auth";
import chatRoute from "./routes/chat";
import messageRoute from "./routes/message";

const app = express();
dotenv.config();

const PORT: number = 5000;

app.use(express.json(), cookieParser());

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

app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
