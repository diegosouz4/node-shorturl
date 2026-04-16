import { Prisma } from "../../src/generated/client";
import { handleErrorDetails } from "../../src/utils/handleErrorDetails.util";
import { HttpError } from "../../src/utils/httpError.util";
import z from 'zod';
import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";


describe('handleErrorDetails', () => {
  it('should handle ZodError correctly', () => {
    const errorTest = new z.ZodError([{ code: "custom", message: "Field is required", path: ["field"] }]);
    expect(handleErrorDetails(errorTest)).toEqual({ message: 'Field is required', statusCode: 400 });
  });

  it('should handle HttpError correctly', () => {
    const errorTest = new HttpError('Custom error message', HTTP_STATUS.UNAUTHORIZED);
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Custom error message', statusCode: HTTP_STATUS.UNAUTHORIZED });
  })

  it('should handle default Error correctly', () => {
    const errorTest = new Error('Custom error message');
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Custom error message', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  })

  it('handle unexpected errors correctly', () => {
    const errorTest = 'Custom error message';
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Unexpected error.', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  })

  it('should handle PrismaClientKnownRequestError with code P2002 correctly', () => {
    const errorTest = new Prisma.PrismaClientKnownRequestError('Duplicate record. Value already exists.', { code: 'P2002', clientVersion: '5.0.0' });
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Duplicate record. Value already exists.', statusCode: HTTP_STATUS.CONFLICT });
  });

  it('should handle PrismaClientKnownRequestError with code P2003 correctly', () => {
    const errorTest = new Prisma.PrismaClientKnownRequestError('Relationship violation. Check the references.', { code: 'P2003', clientVersion: '5.0.0' });
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Relationship violation. Check the references.', statusCode: HTTP_STATUS.BAD_REQUEST });
  });

  it('should handle PrismaClientKnownRequestError with code P2025 correctly', () => {
    const errorTest = new Prisma.PrismaClientKnownRequestError('Record not found.', { code: 'P2025', clientVersion: '5.0.0' });
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Record not found.', statusCode: HTTP_STATUS.NOT_FOUND });
  });

  it('should handle PrismaClientKnownRequestError with a unmapped code correctly', () => {
    const errorTest = new Prisma.PrismaClientKnownRequestError('Error not mapped', { clientVersion: '5.0.0', code: 'P2026' });
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Error processing database operation.', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  });

  it('should handle PrismaClientUnknownRequestError correctly', () => {
    const errorTest = new Prisma.PrismaClientUnknownRequestError('Unexpected error in the database.', { clientVersion: '5.0.0' });
    const result = handleErrorDetails(errorTest);
    expect(result).toMatchObject({ message: 'Unexpected error in the database.', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  });
});