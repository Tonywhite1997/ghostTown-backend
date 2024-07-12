import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { sendClientError, sendServerError } from "../errorhandlers/error";
import { verifyJWT } from "../utils/verifyToken";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
      };
    }
  }
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jwt = req.cookies.jwt;

    if (!jwt) {
      return sendClientError(res, "Unauthorized", 401);
    }
    const decoded = verifyJWT(jwt);

    if (!decoded) {
      return sendClientError(res, "Unathorized", 401);
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.id },
      select: {
        id: true,
      },
    });

    if (!user) {
      return sendClientError(res, "User not found", 404);
    }

    req.user = user;
    next();
  } catch (err) {
    sendServerError({ err, res });
  }
};
