import { ErrorResponseTypes, SuccessResponseTypes } from '../types/controllerResponse.type';
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

export const successResponse = <T>({ message, res, data, pagination, statusCode = HTTP_STATUS.OK }: SuccessResponseTypes<T>) => {
  const responseData = pagination ? { itens: data, pagination } : data;
  return res.status(statusCode).json({ timestamp: new Date().toISOString(), success: true, message, data: responseData });
}

export const errorResponse = ({ message, res, details, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR }: ErrorResponseTypes) => {
  return res.status(statusCode).json({ timestamp: new Date().toISOString(), success: false, message, details });
}