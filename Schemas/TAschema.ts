import { z } from 'zod';

export const TASchema = z.object({
  id: z.string().min(1,'ID is required'),
  name: z.string().min(1 , 'Name is required').max(30, 'Name must be 100 characters or less'),
  ID: z.string()
    .min(1,'Roll number is required')
    .regex(/^\d{4}XPS\d{4}P$/, 'Invalid roll number format. Should be like 2023XPS0905P'),
  email: z.string()
    .email('Invalid email address')  ,
   
  phoneNumber: z.string()
    .min(1,'Phone number is required')
    .regex(/^\d{10}$/, 'Phone number must be 10 digits')
});

// export const PDFSchema = z.object({
//   PDFURL: z.file().min(1, 'PDF URL is required'),
// });

export type TA = z.infer<typeof TASchema>;
// export type PDF = z.infer<typeof PDFSchema>;