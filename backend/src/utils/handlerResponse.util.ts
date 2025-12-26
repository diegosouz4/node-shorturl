import { ErrorResponseTypes, SuccessResponseTypes } from '../types/controllerResponse.type';

export const successResponse = <T>({ message, res, data, pagination, statusCode = 200 }: SuccessResponseTypes<T>) => {
  const responseData = pagination ? { itens: data, pagination } : data;
  return res.status(statusCode).json({ timestamp: new Date().toISOString(), success: true, message, data: responseData });
}

export const errorResponse = ({ message, res, details, statusCode = 500 }: ErrorResponseTypes) => {
  return res.status(statusCode).json({ timestamp: new Date().toISOString(), success: false, message, details });
}