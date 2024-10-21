import { Response } from "express";

export const setCookie = (res: Response, token: string) => {
  return res.cookie("jwt", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "none",
  });
};
