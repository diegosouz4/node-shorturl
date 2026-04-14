import { errorResponse, successResponse } from '../utils/handlerResponse.util';
import { userService } from '../services/user.service';
import { handleErrorDetails } from '../utils/handleErrorDetails.util';

import type { Request, Response } from 'express';
import type { createUserTypes, updateUserTypes } from '../types/user.types';
import type { AuthTokenData } from '../middlewares/ensureAuth.middleware';
import { cursorPaginationsParams } from '../types/cursorPagination.types';
import { logger } from '../utils/logger.util';

class UserController {
  async create(req: Request, res: Response) {
    const log = logger.createLogger('UserController', 'create');

    try {
      const { email, firstName, lastName, password, role } = req.body as createUserTypes;

      const user = await userService.create({ email, firstName, lastName, password, role });
      return successResponse({ res, message: 'Novo usuario freebie criado!', statusCode: 201, data: user });
    } catch (err) {

      const { message, statusCode } = handleErrorDetails(err);
      const { email, firstName, lastName, password, role } = req.body as createUserTypes;

      log.error({ err, payload: { email, firstName, lastName, password, role } }, message);
      return errorResponse({ res, message: 'Erro ao criar usuario', statusCode: statusCode ?? 500, details: message });
    }
  }

  async list(req: Request, res: Response) {
    const log = logger.createLogger('UserController', 'list');
    const jwtUser = (req as AuthTokenData).user;
    const pagination = req.query as cursorPaginationsParams;

    try {
      const users = await userService.list(jwtUser, pagination);
      return successResponse({ res, message: 'Sucesso ao listar usuarios', statusCode: 200, data: users });
    } catch (err) {

      const { message, statusCode } = handleErrorDetails(err);
      log.error({ err, reqUser: jwtUser, pagination }, message);
      return errorResponse({ res, message: 'Erro ao listar usuarios', statusCode: statusCode ?? 500, details: message });
    }
  }

  async find(req: Request, res: Response) {
    const log = logger.createLogger('UserController', 'find');
    const jwtUser = (req as AuthTokenData).user;

    try {
      const { id } = req.params;
      const payloadId = Array.isArray(id) ? id[0] : id;

      const user = await userService.find({ findId: payloadId, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao procurar o usuario', statusCode: 200, data: user });
    } catch (err) {

      const { message, statusCode } = handleErrorDetails(err);
      log.error({ err, reqUser: jwtUser, targetId: req.params.id }, message);
      return errorResponse({ res, message: 'Erro ao procurar o usuario', statusCode: statusCode ?? 500, details: message });
    }
  }

  async update(req: Request, res: Response) {
    const log = logger.createLogger('UserController', 'update');
    const jwtUser = (req as AuthTokenData).user;

    try {
      const { id } = req.params;
      const payload = req.body as updateUserTypes;
      payload.id = Array.isArray(id) ? id[0] : id;;

      await userService.update({ payload, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao procurar o usuario', statusCode: 200 });
    } catch (err) {

      const { message, statusCode } = handleErrorDetails(err);

      const payload = req.body as updateUserTypes;
      log.error({ err, reqUser: jwtUser, payload }, message);
      return errorResponse({ res, message: 'Erro ao procurar o usuario', statusCode: statusCode ?? 500, details: message });
    }
  }

  async reactivate(req: Request, res: Response) {
    const log = logger.createLogger('UserController', 'reactivate');
    const jwtUser = (req as AuthTokenData).user;

    try {
      const { id } = req.params;
      const payloadId = Array.isArray(id) ? id[0] : id;

      const result = await userService.reactivate({ findId: payloadId, reqUser: jwtUser });
      return successResponse({ res, message: "Sucesso ao reativar o usuário", statusCode: 200 });
    } catch (err: unknown) {
      const { message, statusCode } = handleErrorDetails(err);
      log.error({ err, reqUser: jwtUser, targetId: req.params.id }, message);
      return errorResponse({ res, message: "Erro ao reativar o usuário", statusCode: statusCode ?? 500, details: message });
    }
  }

  async delete(req: Request, res: Response) {
    const log = logger.createLogger('UserController', 'delete');
    const jwtUser = (req as AuthTokenData).user;

    try {
      const { id } = req.params;
      const payloadId = Array.isArray(id) ? id[0] : id;

      const user = await userService.delete({ findId: payloadId, reqUser: jwtUser });
      return successResponse({ res, message: 'Sucesso ao deletar o usuario', statusCode: 200 });
    } catch (err) {

      const { message, statusCode } = handleErrorDetails(err);
      log.error({ err, reqUser: jwtUser, targetId: req.params.id }, message);
      return errorResponse({ res, message: 'Erro ao deletar o usuario', statusCode: statusCode ?? 500, details: message });
    }
  }
}

export const userController = new UserController();