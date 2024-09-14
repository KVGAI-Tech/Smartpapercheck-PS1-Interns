import { z } from "zod"

export const LoginSchema = z.object({
    Username: z.string().min(3 , 'Username must be at least 3 characters').max(20 , 'Username must be at most 20 characters'),
    password: z.string().min(8 , 'Password must be at least 8 characters').max(20 , 'Password must be at most 20 characters'    ),
})