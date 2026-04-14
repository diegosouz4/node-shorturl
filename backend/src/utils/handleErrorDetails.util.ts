import z from "zod";
import { Prisma } from "../generated/client";
import { HttpError } from "./httpError.util";

export const handleErrorDetails = (err: unknown) => {
  if (err instanceof z.ZodError) return {
    message: err.issues.map(({ message }) => message).join(', '),
    statusCode: 400
  };

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return { message: 'Registro duplicado. Valor já existente.', statusCode: 409 };
      case 'P2003':
        return { message: 'Violação de relacionamento. Verifique as referências.', statusCode: 400 };
      case 'P2025':
        return { message: 'Registro não encontrado.', statusCode: 404 };
      default:
        return { message: 'Erro ao processar operação no banco de dados.', statusCode: 500 };
    }
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) return {
    message: 'Erro inesperado no banco de dados.',
    statusCode: 500
  };

  if (err instanceof HttpError) return { message: err.message, statusCode: err.statusCode }

  if (err instanceof Error) return { message: err.message, statusCode: 500 };

  return { message: 'Erro inesperado.', statusCode: 500 };
}