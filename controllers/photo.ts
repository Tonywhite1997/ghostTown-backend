import { Response, Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { sendClientError, sendServerError } from "../errorhandlers/error";
import { S3uploadPhoto } from "../aws/upload";

interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

const storage = multer.memoryStorage();
const fileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("only image files are allowed") as any, false);
  }
};
const upload = multer({ storage, fileFilter });

export const uploadPhoto = upload.single("photo");
