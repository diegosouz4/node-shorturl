import { errorResponse, successResponse } from '../utils/handlerResponse.util';
import { userService } from '../services/user.service';
import { handleErrorDetails } from '../utils/handleErrorDetails.util';

import type { Request, Response } from 'express';
import type { createUserTypes, updateUserTypes } from '../types/user.types';
import type { AuthTokenData } from '../middlewares/ensureAuth.middleware';

class UserController {
  async create(req: Request, res: Response) {
    const { email, firstName, lastName, password, role } = req.body as createUserTypes;

    try {
      const user = await userService.create({ email, firstName, lastName, password, role });
      return successResponse({ res, message: 'Novo usuario freebie criado!', statusCode: 201, data: user });
    } catch (err) {

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao criar usuario', statusCode: 500, details });
    }
  }

  async list(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;

    try {
      const users = await userService.list(jwtUser);
      return successResponse({ res, message: 'Sucesso ao listar usuarios', statusCode: 200, data: users });
    } catch (err) {

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao listar usuarios', statusCode: 500, details });
    }
  }

  async find(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;
    const { id } = req.params;

    try {
      const user = await userService.find({ findId: id, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao procurar o usuario', statusCode: 200, data: user });
    } catch (err) {

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao procurar o usuario', statusCode: 500, details });
    }
  }

  async update(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;
    const { id } = req.params;
    const payload = req.body as updateUserTypes;

    payload.id = id;

    try {
      await userService.update({ payload, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao procurar o usuario', statusCode: 200 });
    } catch (err) {

      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao procurar o usuario', statusCode: 500, details });
    }
  }

  async delete(req: Request, res: Response) {
    const jwtUser = (req as AuthTokenData).user;
    const { id } = req.params;

    try {
      const user = await userService.delete({ findId: id, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao deletar o usuario', statusCode: 200 });
    } catch (err) {
      
      let details = handleErrorDetails(err);
      return errorResponse({ res, message: 'Erro ao deletar o usuario', statusCode: 500, details });
    }
  }
}

export const userController = new UserController();