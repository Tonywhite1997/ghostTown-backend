import bcrypt from "bcryptjs";

export const decryptPassword = async (
  password: string,
  userPassword: string
): Promise<boolean> => {
  const decryptedPassword = await bcrypt.compare(password, userPassword);
  return decryptedPassword;
};
