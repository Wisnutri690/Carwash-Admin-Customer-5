import prisma from "../Config/prisma";
import { CreateVehicleInput, UpdateVehicleInput, } from "../Validations/vehicleValidation";

export const getAllVehicles = async () => {
  return await prisma.vehicle.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      id: "asc",
    },
  });
};

export const getVehicleById = async (id: number) => {
  return await prisma.vehicle.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });
};

export const createVehicle = async (
  data: CreateVehicleInput) => {
  return await prisma.vehicle.create({
    data,
  });
};

export const updateVehicle = async (
  id: number,
  data: UpdateVehicleInput
) => {
  return await prisma.vehicle.update({
    where: { id },
    data,
  });
};

export const deleteVehicle = async (id: number) => {
  return await prisma.vehicle.delete({
    where: { id },
  });
};