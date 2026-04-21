// These schemas validate and clean incoming request data before your backend logic runs.

import { z } from 'zod'

const emailSchema = z
    .string()
    .trim()
    .email("Invalid emailSchema format")
    .min(1)
    .max(255)

const passwordSchema = z
    .string()
    .trim()
    .min(4)

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1)
        .max(255),
    email: emailSchema,
    password: passwordSchema
})

const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

// z.infer = auto-generate TypeScript types from validation schema - typesafety
export type registerSchemaType = z.infer<typeof registerSchema>

export type loginSchemaType = z.infer<typeof loginSchema>

export {
    emailSchema,
    registerSchema,
    passwordSchema,
    loginSchema
}