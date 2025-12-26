import type { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/handlerResponse.util';
import { shortURLServices } from '../services/shortUrl.service';

class ShortUrl {
  async create(req: Request, res: Response) {
    const { url } = req.body;
    
    try{
      const created = await shortURLServices.create({ url });
      return successResponse({ res, message: 'Url criada!', statusCode: 201, data: created });
    }catch(err){
      console.log("[shortUrlController | create] Error: ", err);
      return errorResponse({ res, message: 'erro ao criar shorted!', statusCode: 500 })
    }
  }

  async list(req: Request, res: Response) {
    try{
      const list = await shortURLServices.list();
      return successResponse({ res, message: 'Url criada!', statusCode: 201, data: list });
    }catch(err){
      console.log("[shortUrlController | list] Error: ", err);
      return errorResponse({ res, message: 'erro ao criar shorted!', statusCode: 500 })
    }
  }

  find(req: Request, res: Response) {
    const { id } = req.params;
    return successResponse({ res, message: `A URL ${id} foi encontrada` })
  }

  update(req: Request, res: Response) {
    const { id } = req.params;
    return successResponse({ res, message: `A URL ${id} foi atualizada` });
  }

  delete(req: Request, res: Response) {
    const { id } = req.params;
    return successResponse({ res, message: `A URL ${id} foi deletada` });
  }

}

export const shortUrlController = new ShortUrl();