import jwt from "jsonwebtoken";

export const generateJWT = (id: string): string | null => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    });
    return token;
  } catch (err) {
    console.error(err);
    return null;
  }
};
