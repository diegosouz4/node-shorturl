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
  limit: z.coerce.number("Limite informado é inválido").min(1, { error: "Limite não pode ser menor que 1" }).max(50, { error: "Limite não pode ser maior que 50" }).default(limitDefault).optional(),
  cursor: z.string("Cursor informado é inválido").optional(),
});

export const cursorObj = z.object({
  id: z.uuid("Id informado é inválido"),
  createdAt: z.coerce.date("Data informada é inválido")
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

