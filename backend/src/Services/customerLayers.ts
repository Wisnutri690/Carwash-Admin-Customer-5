import prisma from "../Config/prisma";
import { CreateCustomerInput, UpdateCustomerInput, } from "../Validations/customerValidation";

export const getAllCustomers = async () => {
  return await prisma.customer.findMany({
    orderBy: {
      id: "asc",
    },
  });
};

export const getCustomerById = async (id: number) => {
  const customer =  await prisma.customer.findUnique({
    where: {
      id,
    },
    include : {
      vehicles : true,
    },
  });

  if(!customer) {
    throw new Error( 'Customer tidak ditemukan' )
  }

  return customer;
};

export const createCustomer = async (
  data: CreateCustomerInput
) => {
  return await prisma.customer.create({
    data,
  });
};

export const updateCustomer = async (
  id: number,
  data: UpdateCustomerInput
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!customer) {
    throw new Error("Customer tidak ditemukan");
  }

  return await prisma.customer.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteCustomer = async (id: number) => {
  return await prisma.customer.delete({
    where: {
      id,
    },
  });
};