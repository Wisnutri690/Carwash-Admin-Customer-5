import { z } from 'zod';

export const createCustomerSchema = z.object({

    name: z.string().min(1),
    phone: z.string().min(10),
});

export const updateCustomerSchema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;