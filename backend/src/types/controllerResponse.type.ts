import { Response } from 'express';

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
  statusCode?: number;
}

export interface ErrorResponseTypes {
  res: Response;
  message: string;
  details?: any;
  statusCode?: number;
}