import { Response } from "express";

export const sendServerError = ({ res, err }: { res: Response; err: any }) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(500).json({
      message: "server error",
    });
  }

  res.status(500).json({
    message: "server error",
    error: err,
  });
  console.log(err);
};

export const sendClientError = (
  res: Response,
  message: string,
  status: number
) => {
  return res.status(status).json({
    message,
  });
};
