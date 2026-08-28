import { z } from 'zod';

export const createOrderSchema = z.object({
    
    customerId: z.number().int().positive(),

    vehicleId: z.number().int().positive(),

    staffId: z.number().int().positive(),
    
    services: z
    .array(
        z.object({
            serviceId: z.number().int().positive(),
            quantity: z.number().int().positive(),
        })
    )
    .min(1, "Minimal harus memilih 1 services")
});

export const updateOrderSchema = z.object({
    
    status: z 
    .enum(['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .optional(),

    paymentStatus: z
    .enum(['UNPAID', 'PAID'])
    .optional(),

    paymentMethod: z
    .enum(['QRIS', 'CASH', 'TRANSFER'])
    .optional(),

    notes: z
    .string()
    .optional(),

    completedAt: z
    .coerce
    .date()
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;