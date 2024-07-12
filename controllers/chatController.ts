import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendServerError } from "../errorhandlers/error";

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

    res.status(200).json({
      chat,
    });
  } catch (err) {
    sendServerError({ err, res });
  }
};
