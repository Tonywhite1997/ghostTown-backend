import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendClientError, sendServerError } from "../errorhandlers/error";
import { getReceiverSocketId, io } from "../socket/socket";

const prisma = new PrismaClient();

export const sendMessage = async (req: Request, res: Response) => {
  const { id: senderID } = req.user;
  const { id: receiverID } = req.params;
  const { body } = req.body;
  try {
    if (!body) {
      return sendClientError(res, "messsage body required", 401);
    }

    let chat = await prisma.chat.findFirst({
      where: {
        participantIDs: {
          hasEvery: [senderID, receiverID],
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          participantIDs: {
            set: [senderID, receiverID],
          },
        },
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        authorID: senderID,
        chatID: chat?.id,
        body,
      },
    });

    if (newMessage) {
      chat = await prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: {
          messages: {
            connect: {
              id: newMessage.id,
            },
          },
        },
      });
    }

    const sender = await prisma.user.findUnique({
      where: {
        id: senderID,
      },
    });

    const receiverSocketId = getReceiverSocketId(receiverID);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    if (receiverSocketId && sender) {
      io.to(receiverSocketId).emit("newRecipient", sender);
    }

    res.status(200).json(newMessage);
  } catch (err) {
    sendServerError({ res, err });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user;

    if (!userId) {
      return sendClientError(res, "Unauthorized", 401);
    }

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
      return sendClientError(res, "Unauthorized", 401);
    }

    const messages = await prisma.message.findMany({
      where: {
        authorID: user.id,
      },
    });

    res.status(200).json({ messages });
  } catch (err) {
    sendServerError({ res, err });
  }
};
