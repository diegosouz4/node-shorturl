import { errorResponse, successResponse } from '../utils/handlerResponse.util';
import { sessionService } from '../services/session.service';
import { AuthTokenData } from '../middlewares/ensureAuth.middleware';
import { handleErrorDetails } from '../utils/handleErrorDetails.util';
import { logger } from '../utils/logger.util';

import type { Request, Response } from 'express';
import type { createUserTypes } from '../types/user.types';
import type { logintypes } from '../types/session.types';

class SessionController {
  async login(req: Request, res: Response) {
    const log = logger.createLogger('SessionController', 'login');
    const user = req.body as logintypes;

    try {
      const response = await sessionService.login({ ...user });

      res.cookie('token', response.token, { secure: true, maxAge: 86400 * 1000 });

      return successResponse({ res, message: 'Sucesso ao logar!', data: response });
    } catch (err: unknown) {
      log.error({ err, email: (user as logintypes)?.email }, 'Error durante o login');

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'Error durante o login!', statusCode: statusCode ?? 500, details: message })
    }
  }

  async addUser(req: Request, res: Response) {
    const log = logger.createLogger('SessionController', 'addUser');
    const payload = (req.body as createUserTypes);
    const jwtUser = (req as AuthTokenData).user;

    try {
      const newUser = await sessionService.addUser({ payload, reqUser: jwtUser });
      return successResponse({ res, message: 'Novo usuario criado!', statusCode: 201, data: newUser });
    } catch (err: unknown) {
      log.error({ err, email: payload?.email, requestedBy: jwtUser?.id }, 'Error ao criar usuário');

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'Error ao criar usuário!', statusCode: statusCode ?? 500, details: message })
    }
  }
}

export const sessionController = new SessionController();