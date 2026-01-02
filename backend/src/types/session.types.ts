import { z } from 'zod';
import { allowedRoles } from './user.types';

export const loginParams = z.object({
  email: z.email("Email obrigatorio"),
  password: z.string("Senha nao foi informada")
});

export const jwtValidate = z.object({
  token: z.jwt(),
})

export const jwtUserParams = z.object({
  id: z.uuid('Usuario invalido'),
  role: z.enum(allowedRoles, { error: "Valor passado e invalido!" })
})

export type logintypes = z.infer<typeof loginParams>;
export type jwtValidationtypes = z.infer<typeof jwtValidate>;
export type jwtUsertypes = z.infer<typeof jwtUserParams>;