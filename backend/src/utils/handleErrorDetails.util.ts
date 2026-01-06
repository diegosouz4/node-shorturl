import z from "zod";
import { Prisma } from "../generated/client";

export const handleErrorDetails = (err: unknown) => {
  if (err instanceof z.ZodError) return err.issues.map(({ message }) => message).join(', ');

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return 'Registro duplicado. Valor já existente.';
      case 'P2003':
        return 'Violação de relacionamento. Verifique as referências.';
      case 'P2025':
        return 'Registro não encontrado.';
      default:
        return 'Erro ao processar operação no banco de dados.';
    }
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) return 'Erro inesperado no banco de dados.';

  if (err instanceof Error) return err.message;

  return 'Erro inesperado.';
}