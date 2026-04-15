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
import { HttpError } from '../utils/httpError.util';

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
        if (!headers || !headers.authorization) throw new Error("Authorization header not sent");

        const [, token] = headers.authorization.split(' ');
        if (!token) throw new Error("Token not provided");

        jwtValidate.parse({ token });
        const decoded = jwt.verify(token, secret) as JWTUSER;

        const user = await userDb.findUnique({ where: { id: decoded.id } });
        if (!user) throw new HttpError('Invalid user', HTTP_STATUS.UNAUTHORIZED);
        if (decoded.role !== user.role) throw new HttpError("Please log in again!", HTTP_STATUS.UNAUTHORIZED);

        (req as AuthTokenData).user = { ...user };

      } catch (err: unknown) {
        const { message, statusCode } = handleErrorDetails(err);
        log.error({ err }, message);
        return errorResponse({ res, message: "Unauthorized access!", statusCode: statusCode ?? HTTP_STATUS.UNAUTHORIZED, details: message });
      }

      return next();
    }
  }

  ensureRole(allowedRoles: Roles[] = ['ADMIN', 'MASTER']) {
    const log = logger.createLogger('EnsureAuthMiddleware', 'ensureRole');

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const jwtUser = (req as AuthTokenData).user;
        if (!jwtUser || !jwtUser.role) throw new HttpError('Failed to validate user!', HTTP_STATUS.UNAUTHORIZED);
        if (!allowedRoles.includes(jwtUser.role)) throw new HttpError('You do not have authorization to perform this action!', HTTP_STATUS.UNAUTHORIZED);
      } catch (err: unknown) {
        const { message, statusCode } = handleErrorDetails(err);
        log.error({ err, allowedRoles, reqUser: (req as AuthTokenData).user }, message);
        return errorResponse({ res, message: "Unauthorized access!", statusCode: statusCode ?? HTTP_STATUS.UNAUTHORIZED, details: message });
      }

      return next();
    }
  }
}

export const EnsureAuthMiddleware = new Auth(); 