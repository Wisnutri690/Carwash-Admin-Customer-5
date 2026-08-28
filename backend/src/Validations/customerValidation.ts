import { z } from 'zod';

export const createCustomerSchema = z.object({

    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  email: z.string().email("Format email tidak valid").optional(),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").optional(),
});


export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;