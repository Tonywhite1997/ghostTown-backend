import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendClientError, sendServerError } from "../errorhandlers/error";
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
      select: {
        participantIDs: true,
        unread_count: true,
        last_message: true,
        last_message_timeStamp: true,
      },
    });

    if (!chats.length) {
      return res.status(200).json([]);
    }

    const participantIDs = chats.flatMap((chat: any) =>
      chat.participantIDs.filter((id: string) => req.user.id !== id)
    );

    const participants = await Promise.all(
      participantIDs.map(async (participant: string) => {
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

    const data = participants.flatMap((participant: any) => {
      return chats
        .map((chat) => {
          if (chat.participantIDs.includes(participant?.id)) {
            return { ...participant, ...chat };
          }
          return null;
        })
        .filter((item) => item !== null);
    });

    res.status(200).json(data);
  } catch (err: any) {
    sendServerError({ res, err });
  }
};

export const readChats = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return sendClientError(res, "user id is required", 401);

  try {
    const chats = await prisma.chat.updateMany({
      where: {
        participantIDs: {
          hasEvery: [req.user.id, id],
        },
      },
      data: {
        unread_count: 0,
      },
    });

    res.status(200).json(chats);
  } catch (err: any) {
    sendServerError({ res, err });
  }
};
