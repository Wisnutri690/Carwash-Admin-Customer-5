import prisma from "../Config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginInput } from "../Validations/authValidation";

export const login = async ( data: LoginInput ) => {

  const admin = await prisma.admin.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!admin) {
    throw new Error("Email atau password salah");
  }

  const isMatch = await bcrypt.compare(data.password, admin.password);

  if (!isMatch) {
    throw new Error("Email atau password salah");
  }
 
  const token = jwt.sign({
    id: admin.id,
    email: admin.email,},
    process.env.JWT_SECRET!, {expiresIn: "1d",});

    return{
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      },
      token,
    };
};