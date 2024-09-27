import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number is required"),
  profile_info : z.string().min(20  ,  "profile info should be atleast of 20 characters") , 
  password: z.string().min(6, "Password should be at least 6 characters long"),
});
