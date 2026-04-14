import { successResponse, errorResponse } from '../utils/handlerResponse.util';
import { shortURLServices } from '../services/shortUrl.service';
import { handleErrorDetails } from '../utils/handleErrorDetails.util';

import type { Request, Response } from 'express';
import type { AuthTokenData } from '../middlewares/ensureAuth.middleware';
import { cursorPaginationsParams } from '../types/cursorPagination.types';
import { shortCursorPagination } from '../types/shortUrl.types';

class ShortUrlController {
  async create(req: Request, res: Response) {
    try {
      const { originalUrl, expiresAt } = req.body;
      const reqUser = (req as AuthTokenData).user;

      const result = await shortURLServices.create({ payload: { originalUrl, expiresAt }, reqUser });
      return successResponse({ res, message: 'Url criada!', statusCode: 201, data: result });
    } catch (err: unknown) {
      console.log("[shortUrlController | create] Error: ", err);

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'erro ao criar shorted!', statusCode: 500, details });
    }
  }

  async find(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const reqUser = (req as AuthTokenData).user;

      const sanitizeURL = Array.isArray(shortUrl) ? shortUrl[0] : shortUrl;

      const data = await shortURLServices.find({ payload: { shortUrl: sanitizeURL }, reqUser });
      return successResponse({ res, message: 'Url encontrada!', data });
    } catch (err: unknown) {
      console.log("[shortUrlController | find] Error: ", err);

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao encontrar a url', statusCode: 500, details })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const reqUser = (req as AuthTokenData).user;

      const sanitizeURL = Array.isArray(shortUrl) ? shortUrl[0] : shortUrl;

      const data = await shortURLServices.remove({ payload: { shortUrl: sanitizeURL }, reqUser });
      return successResponse({ res, message: 'Url deletada!', statusCode: 204 });
    } catch (err: unknown) {
      console.log("[shortUrlController | delete] Error: ", err);

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao deletar a url', statusCode: 500, details })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const reqUser = (req as AuthTokenData).user;
      const payload = req.body;

      const data = await shortURLServices.update({ payload: { ...payload, shortUrl }, reqUser });
      return successResponse({ res, message: 'Url atualizada!', data });
    } catch (err: unknown) {
      console.log("[shortUrlController | update] Error: ", err);

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao atualizar a url', statusCode: 500, details })
    }
  }

  async list(req: Request, res: Response) {
    try {
      const reqUser = (req as AuthTokenData).user;
      const { cursor, limit, userId } = req.query as shortCursorPagination;

      const data = await shortURLServices.list({ reqUser, filterBy: { userId }, reqPagination: { cursor, limit } });
      return successResponse({ res, message: 'Sucesso ao listar urls!', data });
    } catch (err: unknown) {
      console.log("[shortUrlController | list] Error: ", err);
      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao listar as urls', statusCode: 500, details })
    }
  }
}

export const shortUrlController = new ShortUrlController();