import { z } from 'zod'
import { Roles, UserStatus } from '../generated/enums';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!_+/?\-])[A-Za-z\d@!_+/?\-]{8,16}$/;

export const allowedRoles = Object.values(Roles)
export const allowedUserStatus = Object.values(UserStatus);

export const createUserParams = z.object({
  email: z.email("Email is required!"),
  firstName: z.string("First name is required").min(4, "Invalid first name length"),
  lastName: z.string("Last name is required").min(3, "Last name must be at least 3 characters long"),
  password: z.string("Password is required").regex(passwordRegex, { error: "A weak password was provided!" }),
  role: z.enum(allowedRoles, { error: "Invalid value passed!" }),
  status: z.enum(allowedUserStatus, { error: "Invalid value passed!" }).optional(),
});

export const updateUserParams = z.object({
  id: z.uuid("Invalid user ID!"),
  email: z.email("Email is required!").optional(),
  firstName: z.string("First name is required").min(4, "Invalid first name length").optional(),
  lastName: z.string("Last name is required").min(3, "Last name must be at least 3 characters long").optional(),
  password: z.string("Password is required").regex(passwordRegex, { error: "A weak password was provided!" }).optional(),
  role: z.enum(allowedRoles, { error: "Invalid value passed!" }).optional(),
  status: z.enum(allowedUserStatus, { error: "Invalid value passed!" }).optional(),
});

export const userId = z.object({
  id: z.uuid("Invalid user ID!"),
})

export type createUserTypes = z.infer<typeof createUserParams>;
export type updateUserTypes = z.infer<typeof updateUserParams>;
export type userIdTypes = z.infer<typeof userId>;