import type { Response } from 'express';
import type { HttpStatus } from '../utils/httpsStatusCode.utils';

export interface PaginationMeta {
  path: string;
  prev_page: number | null;
  next_page: number | null;
  last_page: number;
  total_itens: number | null;
}

export interface SuccessResponseTypes<T> {
  res: Response;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
  statusCode?: HttpStatus;
}

export interface ErrorResponseTypes {
  res: Response;
  message: string;
  details?: any;
  statusCode?: HttpStatus;
}

export type policyResult = { statusCode: HttpStatus, isValid: boolean }