import { z } from 'zod';

export const createServiceSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    duration: z.number().int().positive(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
    isActive: z.boolean().optional(),
 });

 export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

