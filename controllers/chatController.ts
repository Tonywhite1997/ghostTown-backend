import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendServerError } from "../errorhandlers/error";
import { getReceiverSocketId, io } from "../socket/socket";

const prisma = new PrismaClient();

export const getChat = async (req: Request, res: Response) => {
  try {
    const { id: receiverID } = req.params;
    const { id: senderID } = req.user;
    let chat = await prisma.chat.findFirst({
      where: {
        participantIDs: {
          hasEvery: [senderID, receiverID],
        },
      },
      select: {
        messages: true,
      },
    });

    res.status(200).json(chat?.messages);
  } catch (err) {
    sendServerError({ err, res });
  }
};

export const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participantIDs: {
          hasSome: [req.user.id],
        },
      },
    });

    if (!chats.length) {
      return res.status(200).json({ chats: [] });
    }

    const participantIDs = chats.flatMap((chat) =>
      chat.participantIDs.filter((id) => req.user.id !== id)
    );

    const participants = await Promise.all(
      participantIDs.map(async (participant) => {
        return await prisma.user.findUnique({
          where: {
            id: participant,
          },
          select: {
            id: true,
            username: true,
            profilePicURL: true,
          },
        });
      })
    );

    const receiverSocketId = getReceiverSocketId(req.user.id);
    io.to(receiverSocketId).emit("chatRecipients", participants);

    res.status(200).json(participants);
  } catch (err: any) {
    sendServerError({ res, err });
  }
};
