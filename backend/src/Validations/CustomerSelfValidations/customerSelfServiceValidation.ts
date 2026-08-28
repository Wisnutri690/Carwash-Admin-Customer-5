import { z } from "zod";

export const customerAddVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plat nomor wajib diisi"),
  brand: z.string().min(1, "Merk kendaraan wajib diisi"),
  model: z.string().min(1, "Model kendaraan wajib diisi"),
  color: z.string().min(1, "Warna kendaraan wajib diisi"),
  year: z.number().int().positive().optional(),
});

export type CustomerAddVehicleInput = z.infer<typeof customerAddVehicleSchema>;
