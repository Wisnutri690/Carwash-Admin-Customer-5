import { z } from 'zod';

export const createVehicleSchema = z.object({
    plateNumber: z.string().min(1),
    brand: z.string().min(1),
    model: z.string().min(1),
    color: z.string().min(1),
    year: z.number().int().positive().optional(),
    customerId: z.number().int().positive(),
});

export const updateVehicleSchema = createVehicleSchema.partial()

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;