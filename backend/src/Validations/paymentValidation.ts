import { z } from 'zod';

export const paymentSchema = z.object({
    paymentMethod: z.enum(["QRIS", "CASH", 'TRANSFER']),
});

export type PaymentInput = z.infer<typeof paymentSchema>;