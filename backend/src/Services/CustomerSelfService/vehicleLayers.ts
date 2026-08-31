import prisma from "../../Config/prisma";
import { CustomerAddVehicleInput } from "../../Validations/CustomerSelfValidations/customerSelfServiceValidation";

export const getVehicles = async (customerId: number) => {
  return await prisma.vehicle.findMany({
    where: { customerId },
    orderBy: { id: "asc" },
  });
};

export const addMyVehicle = async (
  customerId: number,
  data: CustomerAddVehicleInput
) => {
  const existingPlate = await prisma.vehicle.findUnique({
    where: { plateNumber: data.plateNumber },
  });

  if (existingPlate) {
    throw new Error("Plat nomor kendaraan sudah terdaftar di sistem kami");
  }
  return await prisma.vehicle.create({
    data: {
      ...data,
      customerId,
    },
  });
};

export const updateMyVehicle = async (
  customerId: number,
  vehicleId: number,
  data: {
    plateNumber?: string;
    brand?: string;
    model?: string;
    color?: string;
    year?: number;
  }
) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      customerId,
    },
  });
  if (!vehicle) {
    throw new Error("Kendaraan tidak ditemukan atau bukan milik Anda");
  }

  if (data.plateNumber && data.plateNumber !== vehicle.plateNumber) {
    const existingPlate = await prisma.vehicle.findUnique({
      where: { plateNumber: data.plateNumber },
    });
    if (existingPlate) {
      throw new Error("Plat nomor kendaraan sudah terdaftar di sistem");
    }
  }

  return await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      plateNumber: data.plateNumber,
      brand: data.brand,
      model: data.model,
      color: data.color,
      year: data.year,
    },
  });
};

export const deleteMyVehicle = async (
  customerId: number,
  vehicleId: number
) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      customerId,
    },
  });
  if (!vehicle) {
    throw new Error("Kendaraan tidak ditemukan atau bukan milik Anda");
  }
  const activeOrder = await prisma.order.findFirst({
    where: {
      vehicleId,
      status: {
        in: ["WAITING", "IN_PROGRESS"],
      },
    },
  });
  if (activeOrder) {
    throw new Error(
      "Kendaraan tidak dapat dihapus karena sedang dalam proses antrean/pencucian"
    );
  }
  return await prisma.vehicle.delete({
    where: { id: vehicleId },
  });
};
