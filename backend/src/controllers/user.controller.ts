import type { Request, Response } from 'express';
import type { createUserTypes, updateUserTypes } from '../types/user.types';

import { errorResponse, successResponse } from '../utils/handlerResponse.util';
import { UserService } from '../services/user.service';
import { z } from 'zod';
import { AuthTokenData } from '../middlewares/ensureAuth.middleware';


class User {
  async create(req: Request, res: Response) {
    const { email, firstName, lastName, password, role } = req.body as createUserTypes;

    try {
      const user = await UserService.create({ email, firstName, lastName, password, role });
      return successResponse({ res, message: 'Novo usuario freebie criado!', statusCode: 201, data: user });
    } catch (err) {
      // console.log("[UserController | create] Error: ", err);
      let details = '';

      if (err instanceof z.ZodError) {
        details = err.issues.map(e => e.message).join(', ');
      } else if (err instanceof Error) {
        details = err.message;
      }

      return errorResponse({ res, message: 'Erro ao criar usuario', statusCode: 500, details });
    }
  }

  async list(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;

    try {
      const users = await UserService.list(jwtUser);
      return successResponse({ res, message: 'Sucesso ao listar usuarios', statusCode: 200, data: users });
    } catch (err) {
      let details = '';

      if (err instanceof Error) {
        details = err.message;
      }

      return errorResponse({ res, message: 'Erro ao listar usuarios', statusCode: 500, details });
    }
  }

  async find(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;
    const { id } = req.params;

    try {
      const user = await UserService.find({ findId: id, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao procurar o usuario', statusCode: 200, data: user });
    } catch (err) {
      let details = '';

      if (err instanceof Error) {
        details = err.message;
      }

      return errorResponse({ res, message: 'Erro ao procurar o usuario', statusCode: 500, details });
    }
  }

  async update(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;
    const { id } = req.params;
    const payload = req.body as updateUserTypes;

    payload.id = id;

    try {
      await UserService.update({payload, reqUser: jwtUser});
      return successResponse({ res, message: 'Sucesso ao procurar o usuario', statusCode: 200 });
    } catch (err) {
      let details = '';

      if (err instanceof Error) {
        details = err.message;
      }

      return errorResponse({ res, message: 'Erro ao procurar o usuario', statusCode: 500, details });
    }
  }

  async delete(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;
    const { id } = req.params;

    try {
      const user = await UserService.delete({ findId: id, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao deletar o usuario', statusCode: 200 });
    } catch (err) {
      let details = '';

      if (err instanceof Error) {
        details = err.message;
      }

      return errorResponse({ res, message: 'Erro ao deletar o usuario', statusCode: 500, details });
    }
  }
}

export const UserController = new User();