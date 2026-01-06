import { successResponse, errorResponse } from '../utils/handlerResponse.util';
import { shortURLServices } from '../services/shortUrl.service';
import { handleErrorDetails } from '../utils/handleErrorDetails.util';

import type { Request, Response } from 'express';
import type { AuthTokenData } from '../middlewares/ensureAuth.middleware';

class ShortUrlController {
  async create(req: Request, res: Response) {
    try {
      const { url, expired } = req.body;
      const reqUser = (req as AuthTokenData).user;

      const result = await shortURLServices.create({ payload: { url, expired }, reqUser });
      return successResponse({ res, message: 'Url criada!', statusCode: 201, data: result });
    } catch (err: unknown) {
      console.log("[shortUrlController | create] Error: ", err);

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'erro ao criar shorted!', statusCode: 500, details })
    }
  }

  async find(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const reqUser = (req as AuthTokenData).user;

      const data = await shortURLServices.find({ payload: { shortUrl }, reqUser });
      return successResponse({ res, message: 'Url encontrada!', data });
    } catch (err: unknown) {
      console.log("[shortUrlController | find] Error: ", err);

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao encontrar a url', statusCode: 500, details })
    }
  }
}

export const shortUrlController = new ShortUrlController();