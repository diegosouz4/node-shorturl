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
        return { message: 'Registro duplicado. Valor já existente.', statusCode: HTTP_STATUS.CONFLICT };
      case 'P2003':
        return { message: 'Violação de relacionamento. Verifique as referências.', statusCode: HTTP_STATUS.BAD_REQUEST };
      case 'P2025':
        return { message: 'Registro não encontrado.', statusCode: HTTP_STATUS.NOT_FOUND };
      default:
        return { message: 'Erro ao processar operação no banco de dados.', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };
    }
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) return {
    message: 'Erro inesperado no banco de dados.',
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
  };

  if (err instanceof HttpError) return { message: err.message, statusCode: err.statusCode }

  if (err instanceof Error) return { message: err.message, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };

  return { message: 'Erro inesperado.', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };
}