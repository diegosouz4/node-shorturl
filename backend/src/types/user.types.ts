import { z } from 'zod'
import { Roles } from '../generated/enums';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!_+/?\-])[A-Za-z\d@!_+/?\-]{8,16}$/;

export const allowedRoles = Object.values(Roles)

export const createUserParams = z.object({
  email: z.email("Email e obrigatorio!"),
  firstName: z.string("Campo obrigatorio").min(4, "Tamanho de nome invalido"),
  lastName: z.string("Campo obrigatorio").min(3, "Sobrenome tem que ter mais de 3 letras"),
  password: z.string("Campo obrigatorio").regex(passwordRegex, { error: "Uma senha fraca foi informada!" }),
  role: z.enum(allowedRoles, { error: "Valor passado e invalido!" })
});

export const updateUserParams = z.object({
  id: z.uuid("Id de usuario invalido!"),
  email: z.email("Email e obrigatorio!").optional(),
  firstName: z.string("Campo obrigatorio").min(4, "Tamanho de nome invalido").optional(),
  lastName: z.string("Campo obrigatorio").min(3, "Sobrenome tem que ter mais de 3 letras").optional(),
  password: z.string("Campo obrigatorio").regex(passwordRegex, { error: "Uma senha fraca foi informada!" }).optional(),
  role: z.enum(allowedRoles, { error: "Valor passado e invalido!" }).optional()
});

export const userId = z.object({
  id: z.uuid("Id de usuario invalido!"),
})

export type createUserTypes = z.infer<typeof createUserParams>;
export type updateUserTypes = z.infer<typeof updateUserParams>;
export type userIdTypes = z.infer<typeof userId>;