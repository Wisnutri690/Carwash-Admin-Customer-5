import { z } from "zod";

export const customerAddVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plat nomor wajib diisi"),
  brand: z.string().min(1, "Merk kendaraan wajib diisi"),
  model: z.string().min(1, "Model kendaraan wajib diisi"),
  color: z.string().min(1, "Warna kendaraan wajib diisi"),
  year: z.number().int().positive().optional(),
});

export const customerCreateOrderSchema = z.object({
  vehicleId: z.number().int().positive("Pilih kendaraan yang valid"),
  services: z
    .array(
      z.object({
        serviceId: z.number().int().positive("Pilih layanan yang valid"),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1, "Pilih minimal satu layanan cuci"),
  notes: z.string().optional(),
});

export type CustomerAddVehicleInput = z.infer<typeof customerAddVehicleSchema>;
export type CustomerCreateOrderInput = z.infer<typeof customerCreateOrderSchema>;
