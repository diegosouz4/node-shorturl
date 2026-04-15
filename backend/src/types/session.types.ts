import { z } from 'zod';
import { allowedRoles } from './user.types';

export const loginParams = z.object({
  email: z.email("Email is required!"),
  password: z.string("Password is required")
});

export const jwtValidate = z.object({
  token: z.jwt(),
})

export const jwtUserParams = z.object({
  id: z.uuid("Invalid user ID!"),
  role: z.enum(allowedRoles, { error: "Invalid value passed!" })
})

export type logintypes = z.infer<typeof loginParams>;
export type jwtValidationtypes = z.infer<typeof jwtValidate>;
export type jwtUsertypes = z.infer<typeof jwtUserParams>;