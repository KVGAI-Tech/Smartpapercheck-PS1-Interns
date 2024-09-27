import { z } from "zod"

export const LoginSchema = z.object({
    Username: z.string().email(),
    password: z.string().min(8 , 'Password must be at least 8 characters').max(20 , 'Password must be at most 20 characters'    ),
})