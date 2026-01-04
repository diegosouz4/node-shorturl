import type { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/handlerResponse.util';
import { createUserParams, createUserTypes } from '../types/user.types';
import { SessionService } from '../services/session.service';
import { logintypes } from '../types/session.types';
import { AuthTokenData } from '../middlewares/ensureAuth.middleware';

import { z } from 'zod'
import { id } from 'zod/v4/locales';

class Session {
  async login(req: Request, res: Response) {
    const user = req.body as logintypes;

    try {
      const response = await SessionService.login({ ...user });

      res.cookie('token', response.token, { secure: true, maxAge: 86400 * 1000 });

      return successResponse({ res, message: 'Sucesso ao logar!', data: response });
    } catch (err) {
      console.log("[SessionController | login] Error: ", err);
      return errorResponse({ res, message: 'Error ao logar!', statusCode: 500 })
    }
  }

  async addUser(req: Request, res: Response) {
    const payload = (req.body as createUserTypes);
    const jwtUser = (req as AuthTokenData).user;

    try {
      const newUser = await SessionService.addUser({ payload, reqUser: jwtUser });
      return successResponse({ res, message: 'Novo usuario criado!', statusCode: 201, data: newUser });
    } catch (err: unknown) {
      let details = '';

      if (err instanceof z.ZodError) {
        details = err.issues.map(({ message }) => message).join(',');
      } else if (err instanceof Error) {
        details = err.message;
      }

      console.log("[SessionController | addUser] Error: ", err);
      return errorResponse({ res, message: 'Error ao criar usuário!', statusCode: 500, details })
    }
  }
}

export const SessionController = new Session();