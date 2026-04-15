import z from 'zod';
import { config } from '../config/system.config';

const limitDefault = config.pagination.limit;

export type cursorPaginations<T> = {
  nextCursor: string | null;
  prevCursor: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  data: T[];
}

export const cursorParams = z.object({
  limit: z.coerce.number("Invalid limit provided").min(1, { error: "Limit cannot be less than 1" }).max(50, { error: "Limit cannot be greater than 50" }).default(limitDefault).optional(),
  cursor: z.string("Invalid cursor provided").optional(),
});

export const cursorObj = z.object({
  id: z.uuid("Invalid ID provided"),
  createdAt: z.coerce.date("Invalid date provided")
});

export type cursorPaginationsParams = z.infer<typeof cursorParams>;
export type cursorObjTypes = z.infer<typeof cursorObj>;

type encoderParams = {
  id: string;
  createdAt: Date;
}

export const encodeCursor = (cursor: encoderParams) => {
  const json = JSON.stringify(cursor);
  return Buffer.from(json).toString('base64');
};

export const decodeCursor = (cursor: string) => {
  const json = Buffer.from(cursor, 'base64').toString('utf-8');
  return JSON.parse(json);
};

