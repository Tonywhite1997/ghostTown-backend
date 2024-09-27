import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { S3uploadPhoto } from "../aws/upload";
import { sendClientError, sendServerError } from "../errorhandlers/error";
import { getReceiverSocketId, io } from "../socket/socket";

const prisma = new PrismaClient();

export const sendMessage = async (req: Request, res: Response) => {
  const { id: senderID } = req.user;
  const { id: receiverID } = req.params;
  const { body } = req.body;
  try {
    if (!body && !req.file) {
      return sendClientError(res, "you need to send something", 401);
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

    let photoURL: string | undefined;

    if (req.file) {
      const { objectURL } = await S3uploadPhoto(req.file);
      photoURL = objectURL;
    }

    const newMessage = await prisma.message.create({
      data: {
        authorID: senderID,
        chatID: chat?.id,
        body: body || null,
        photoURL: photoURL || null,
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
          last_message: newMessage.body || newMessage.photoURL || "",
          unread_count: chat.unread_count + 1,
          last_message_timeStamp: newMessage.updated_at,
        },
      });
    }

    const receiverSocketId = getReceiverSocketId(receiverID);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    const chats = await prisma.chat.findMany({
      where: {
        participantIDs: {
          hasSome: [receiverID],
        },
      },
      select: {
        participantIDs: true,
        unread_count: true,
        last_message: true,
        last_message_timeStamp: true,
      },
    });

    //reciverid change from req.user.id
    if (chats.length) {
      const participantIDs = chats.flatMap((chat: any) =>
        chat.participantIDs.filter((id: string) => receiverID !== id)
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
              return { ...participant, ...chat };
            }
            return null;
          })
          .filter((item) => item !== null);
      });

      if (receiverSocketId && chats) {
        io.to(receiverSocketId).emit("chatRecipients", data);
      }
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
