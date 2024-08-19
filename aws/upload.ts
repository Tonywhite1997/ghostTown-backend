import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateRandomNums } from "../utils/generateRandomNum";

type fileType = {
  fieldname: string;
  mimetype: string;
  originalname: string;
  size: number;
  buffer: Buffer;
};

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

if (!accessKeyId || !secretAccessKey || !region) {
  throw new Error(
    "AWS credentials or region are not defined in the environment variables."
  );
}

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

export const S3uploadPhoto = async (file: fileType) => {
  const strings = generateRandomNums();

  const Key = `${strings}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key,
    ContentType: file.mimetype,
    Body: file.buffer,
  };

  const putObj = new PutObjectCommand(params);
  await s3.send(putObj);
  const objectURL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;

  return { objectURL };
};
