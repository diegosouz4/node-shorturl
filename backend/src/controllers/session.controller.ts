import type { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/handlerResponse.util';
import { createUserParams, createUserTypes } from '../types/user.types';
import { SessionService } from '../services/session.service';
import { logintypes } from '../types/session.types';

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
    try {
      return successResponse({ res, message: 'Novo usuario criado!', statusCode: 201 });
    } catch (err) {
      console.log("[SessionController | addUser] Error: ", err);
      return errorResponse({ res, message: 'erro ao criar shorted!', statusCode: 500 })
    }
  }
}

export const SessionController = new Session();