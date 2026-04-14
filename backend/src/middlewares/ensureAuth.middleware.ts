import type { Request, Response, NextFunction } from 'express';
import type { Roles } from '../generated/client';
import { errorResponse } from '../utils/handlerResponse.util';
import { jwtValidate } from '../types/session.types';
import { z } from 'zod'
import { db } from '../config/db.config';
import type { User } from '../generated/client';

import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.util';
import { config } from '../config/system.config';
import { handleErrorDetails } from '../utils/handleErrorDetails.util';
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

const { secret } = config.jwt;
const userDb = db.user;

export type JWTUSER = {
  id: string;
  role: Roles;
}

export interface AuthTokenData extends Request {
  user: User;
}

class Auth {
  ensureAuth() {
    const log = logger.createLogger('EnsureAuthMiddleware', 'ensureAuth');
    return async (req: Request, res: Response, next: NextFunction) => {
      const { headers } = req;

      try {
        if (!headers || !headers.authorization) throw new Error("Headers nao enviado");

        const [, token] = headers.authorization.split(' ');
        if (!token) throw new Error("Token nao enviado");

        jwtValidate.parse({ token });
        const decoded = jwt.verify(token, secret) as JWTUSER;

        const user = await userDb.findUnique({ where: { id: decoded.id } });
        if (!user) throw new Error('Usuário inválido');
        if (decoded.role !== user.role) throw new Error("É preciso fazer o login novamente!");

        (req as AuthTokenData).user = { ...user };

      } catch (err: unknown) {
        const { message, statusCode } = handleErrorDetails(err);
        log.error({ err }, message);
        return errorResponse({ res, message: "Acesso não autorizado!", statusCode: statusCode ?? HTTP_STATUS.UNAUTHORIZED, details: message });
      }

      return next();
    }
  }

  ensureRole(allowedRoles: Roles[] = ['ADMIN', 'MASTER']) {
    const log = logger.createLogger('EnsureAuthMiddleware', 'ensureRole');

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const jwtUser = (req as AuthTokenData).user;
        if (!jwtUser || !jwtUser.role) throw new Error('Erro ao validar usuario!');
        if (!allowedRoles.includes(jwtUser.role)) throw new Error('Você não tem autorização para executar esse tipo de ação!');
      } catch (err: unknown) {
        const { message, statusCode } = handleErrorDetails(err);
        log.error({ err, allowedRoles, reqUser: (req as AuthTokenData).user }, message);
        return errorResponse({ res, message: "Acesso nao autorizado!", statusCode: statusCode ?? HTTP_STATUS.UNAUTHORIZED, details: message });
      }

      return next();
    }
  }
}

export const EnsureAuthMiddleware = new Auth(); 