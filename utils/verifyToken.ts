import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyJWT = (token: string): JwtPayload | null => {
  try {
    const decoded: JwtPayload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    return decoded;
  } catch (err: any) {
    console.error(err);
    return null;
  }
};
