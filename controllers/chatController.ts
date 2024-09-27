import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendClientError, sendServerError } from "../errorhandlers/error";

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
      include: {
        messages: {
          orderBy: {
            created_at: "asc",
          },
        },
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
        messages: true,
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

    const data = participants.flatMap((participant: any) => {
      return chats
        .map((chat) => {
          if (chat.participantIDs.includes(participant?.id)) {
            const messagesLength = chat.messages.length;
            const lastAuthor = chat.messages[messagesLength - 1];
            return {
              ...participant,
              unread_count: chat.unread_count,
              last_message: chat.last_message,
              last_message_timeStamp: chat.last_message_timeStamp,
              lastAuthor: lastAuthor.authorID,
            };
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
