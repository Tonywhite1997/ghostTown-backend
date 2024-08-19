import { Response, Request } from "express";
import multer from "multer";
import { sendClientError, sendServerError } from "../errorhandlers/error";
import { S3uploadPhoto } from "../aws/upload";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadPhoto = upload.single("photo");

export const savePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendClientError(res, "no file detected", 400);
    }

    const { objectURL } = await S3uploadPhoto(req.file);

    res.status(200).json({ body: objectURL });
  } catch (err) {
    console.log(err);
    sendServerError({ res, err });
  }
};
