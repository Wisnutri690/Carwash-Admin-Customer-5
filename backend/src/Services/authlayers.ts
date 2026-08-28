import prisma from "../Config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  LoginInput,
  CustomerLoginInput,
  CustomerRegisterInput,
} from "../Validations/authValidation";

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
 
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: "ADMIN" },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

    return{
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      },
      token,
    };
};

export const customerLogin = async ( data: CustomerLoginInput) => {
  const customer = await prisma.customer.findUnique({
    where: {email: data.email},
  });

  if(!customer) {
    return {
      exists: false,
      message: 'Customer belum terdaftar, Silahkan registrasi terlebih dahulu',
    };
  }

  const token = jwt.sign(
    { id: customer.id, email: customer.email, role: 'CUSTOMER'},
    process.env.JWT_SECRET!,
    {expiresIn: '7d'}
  );

  return {
    exists: true, token,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,

    },
  };
};

export const customerRegister = async (data: CustomerRegisterInput) => {
  const existingEmail =  await prisma.customer.findUnique({
    where: {email : data.email},
  });
  if (existingEmail) {
    throw new Error ('Email sudah terdaftar');
  };

  const existingPhone = await prisma.customer.findUnique({
    where: { phone: data.phone},
  });
  if(existingPhone) {
    throw new Error ('Nomor telepon sudah terdaftar');
  }

  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
  });

  const token = jwt.sign( 
    { id: customer.id, email: customer.email, role: "CUSTOMER"},
    process.env.JWT_SECRET!,
    { expiresIn: '7d'}
  );

  return {
        token,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
  };
}

