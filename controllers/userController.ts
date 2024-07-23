import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendClientError, sendServerError } from "../errorhandlers/error";
const Prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  const offset: number | any = req.query.offset;

  try {
    const users = await Prisma.user.findMany({
      where: {
        id: {
          not: req.user.id,
        },
      },
      skip: +offset,
      take: 20,
      select: {
        username: true,
        profilePicURL: true,
        id: true,
      },
    });
    res.status(200).json(users);
  } catch (err: any) {
    sendServerError({ res, err });
  }
};
export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) return sendClientError(res, "no id provided", 400);
  try {
    const user = await Prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        profilePicURL: true,
        id: true,
      },
    });

    if (!user) return sendClientError(res, "no user found", 404);

    res.status(200).json(user);
  } catch (err: any) {
    sendServerError({ res, err });
  }
};
