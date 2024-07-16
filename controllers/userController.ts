import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendServerError } from "../errorhandlers/error";
const Prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  const offset = parseInt(req.params.offset) | 0;
  try {
    const users = await Prisma.user.findMany({
      where: {
        id: {
          not: req.user.id,
        },
      },
      skip: offset,
      take: 20,
      select: {
        username: true,
        profilePicURL: true,
      },
    });
    res.status(200).json(users);
  } catch (err: any) {
    sendServerError({ res, err });
  }
};
