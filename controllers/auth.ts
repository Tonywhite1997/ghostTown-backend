import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

import { sendServerError, sendClientError } from "../errorhandlers/error";
import { encryptPassword } from "../utils/encryptPassword";
import { generateJWT } from "../utils/generateToken";
import { setCookie } from "../utils/setcookie";
import { decryptPassword } from "../utils/decryptPassword";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, gender, email } = req.body;

    if (!username || !password || !gender || !email) {
      return sendClientError(res, "all fields required", 401);
    }

    const usernameExists = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (usernameExists) {
      return sendClientError(res, "username already exists", 401);
    }

    const hashedPassword = await encryptPassword(password);

    const maleAvatar: string = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const femaleAvatar: string = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        gender,
        email,
        profilePicURL: gender === "male" ? maleAvatar : femaleAvatar,
      },
    });

    if (newUser) {
      const token: string | null = generateJWT(newUser.id);

      if (!token) {
        return sendServerError({ res, err: "JWT Error" });
      }

      setCookie(res, token);
    }

    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
    });
  } catch (err: any) {
    sendServerError({ err, res });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendClientError(res, "username and password required", 400);
    }

    const user = await prisma.user.findFirst({ where: { username } });

    if (!user) {
      return sendClientError(res, "invalid credentials", 401);
    }

    const isPasswordCorrect: boolean = await decryptPassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return sendClientError(res, "invalid credentials", 401);
    }

    const token: string | null = generateJWT(user.id);

    if (!token) {
      return sendServerError({ res, err: "JWT Error" });
    }

    setCookie(res, token);

    res.status(200).json({
      id: user.id,
      username: user.username,
      profilePicURL: user.profilePicURL,
    });
  } catch (err: any) {
    sendServerError({ res, err });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jtw", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logout successfully" });
  } catch (err) {
    sendServerError({ res, err });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const me = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: {
        username: true,
        email: true,
        profilePicURL: true,
        id: true,
      },
    });

    if (!me) {
      return sendClientError(res, "Unathorized", 401);
    }

    res.status(200).json(me);
  } catch (err) {
    sendServerError({ err, res });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword && !newPassword)
    return sendClientError(res, "old and new password needed", 400);

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true, id: true },
    });

    if (!user) return sendClientError(res, "Unauthorized", 401);

    const isPasswordCorrect: boolean = await decryptPassword(
      oldPassword,
      user.password
    );

    if (!isPasswordCorrect)
      return sendClientError(res, "incorrect password", 401);

    const encryptedPassword = await encryptPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: encryptedPassword,
      },
    });

    res.status(200).json({
      message: "password changed successfully",
    });
  } catch (err: any) {
    sendServerError({ res, err });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) return sendClientError(res, "please enter your password", 402);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) return sendClientError(res, "user not exist", 400);

    const isPassCorrect: boolean = await decryptPassword(
      password,
      user.password
    );

    if (!isPassCorrect) return sendClientError(res, "incorrect password", 401);

    await prisma.user.delete({ where: { id: user.id } });
    res.status(200).json({ message: "Deleted" });
  } catch (err: any) {
    sendServerError({ res, err });
    console.log(err);
  }
};
