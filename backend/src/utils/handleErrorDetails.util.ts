import z from "zod";
import { Prisma } from "../generated/client";
import { HttpError } from "./httpError.util";
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

export const handleErrorDetails = (err: unknown) => {
  if (err instanceof z.ZodError) return {
    message: err.issues.map(({ message }) => message).join(', '),
    statusCode: HTTP_STATUS.BAD_REQUEST
  };

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return { message: 'Duplicate record. Value already exists.', statusCode: HTTP_STATUS.CONFLICT };
      case 'P2003':
        return { message: 'Relationship violation. Check the references.', statusCode: HTTP_STATUS.BAD_REQUEST };
      case 'P2025':
        return { message: 'Record not found.', statusCode: HTTP_STATUS.NOT_FOUND };
      default:
        return { message: 'Error processing database operation.', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };
    }
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) return {
    message: 'Unexpected error in the database.',
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
  };

  if (err instanceof HttpError) return { message: err.message, statusCode: err.statusCode }

  if (err instanceof Error) return { message: err.message, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };

  return { message: 'Unexpected error.', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };
}