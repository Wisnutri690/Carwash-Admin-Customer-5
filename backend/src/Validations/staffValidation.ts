import { z } from 'zod';

export const updateStaffStatusSchema = z.object({
    isActive: z.boolean(),
});

export type updateStaffStatusSchemaInput = z.infer<typeof updateStaffStatusSchema>;