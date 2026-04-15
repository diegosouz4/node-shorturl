import { successResponse, errorResponse } from '../utils/handlerResponse.util';
import { shortURLServices } from '../services/shortUrl.service';
import { handleErrorDetails } from '../utils/handleErrorDetails.util';
import { logger } from '../utils/logger.util';

import type { Request, Response } from 'express';
import type { AuthTokenData } from '../middlewares/ensureAuth.middleware';
import { shortCursorPagination } from '../types/shortUrl.types';
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

class ShortUrlController {
  async create(req: Request, res: Response) {
    const log = logger.createLogger('ShortUrlController', 'create');

    try {
      const { originalUrl, expiresAt } = req.body;
      const reqUser = (req as AuthTokenData).user;

      const result = await shortURLServices.create({ payload: { originalUrl, expiresAt }, reqUser });
      return successResponse({ res, message: 'Url criada!', statusCode: HTTP_STATUS.CREATED, data: result });
    } catch (err: unknown) {
      log.error({ err, userId: (req as AuthTokenData).user?.id }, 'Erro ao criar short URL');

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao criar short URL!', statusCode: statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR, details: message });
    }
  }

  async find(req: Request, res: Response) {
    const log = logger.createLogger('ShortUrlController', 'find');

    try {
      const { shortUrl } = req.params;
      const reqUser = (req as AuthTokenData).user;

      const sanitizeURL = Array.isArray(shortUrl) ? shortUrl[0] : shortUrl;

      const data = await shortURLServices.find({ payload: { shortUrl: sanitizeURL }, reqUser });
      return successResponse({ res, message: 'Url encontrada!', data });
    } catch (err: unknown) {
      log.error({ err, shortUrl: req.params.shortUrl, userId: (req as AuthTokenData).user?.id }, 'Erro ao encontrar short URL');

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao encontrar short URL', statusCode: statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR, details: message });
    }
  }

  async delete(req: Request, res: Response) {
    const log = logger.createLogger('ShortUrlController', 'delete');

    try {
      const { shortUrl } = req.params;
      const reqUser = (req as AuthTokenData).user;

      const sanitizeURL = Array.isArray(shortUrl) ? shortUrl[0] : shortUrl;

      const data = await shortURLServices.remove({ payload: { shortUrl: sanitizeURL }, reqUser });
      return successResponse({ res, message: 'Url deletada!', statusCode: HTTP_STATUS.NO_CONTENT });
    } catch (err: unknown) {
      log.error({ err, shortUrl: req.params.shortUrl, userId: (req as AuthTokenData).user?.id }, 'Erro ao deletar short URL');

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao deletar short URL', statusCode: statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR, details: message });
    }
  }

  async update(req: Request, res: Response) {
    const log = logger.createLogger('ShortUrlController', 'update');

    try {
      const { shortUrl } = req.params;
      const reqUser = (req as AuthTokenData).user;
      const payload = req.body;

      const data = await shortURLServices.update({ payload: { ...payload, shortUrl }, reqUser });
      return successResponse({ res, message: 'Url atualizada!', data });
    } catch (err: unknown) {
      log.error({ err, shortUrl: req.params.shortUrl, userId: (req as AuthTokenData).user?.id }, 'Erro ao atualizar short URL');

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao atualizar short URL', statusCode: statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR, details: message });
    }
  }

  async list(req: Request, res: Response) {
    const log = logger.createLogger('ShortUrlController', 'list');

    try {
      const reqUser = (req as AuthTokenData).user;
      const { cursor, limit, userId } = req.query as shortCursorPagination;

      const data = await shortURLServices.list({ reqUser, filterBy: { userId }, reqPagination: { cursor, limit } });
      return successResponse({ res, message: 'Sucesso ao listar urls!', data });
    } catch (err: unknown) {
      log.error({ err, userId: (req as AuthTokenData).user?.id, filterUserId: (req.query as shortCursorPagination).userId }, 'Erro ao listar short URLs');

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao listar short URLs', statusCode: statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR, details: message });
    }
  }
}

export const shortUrlController = new ShortUrlController();