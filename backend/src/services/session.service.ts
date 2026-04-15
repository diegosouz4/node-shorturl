import { type logintypes, jwtUserParams, loginParams } from "../types/session.types";
import type { User } from "../generated/client";
import { userModel } from "../model/user.model";
import { createUserParams, createUserTypes } from "../types/user.types";
import { handleUserPass } from "../utils/handleUserPass.util";

import jwt from 'jsonwebtoken';
import { config } from '../config/system.config';
import { UserPolicy } from "../policies/user.policy";
import { HttpError } from "../utils/httpError.util";
import { HTTP_STATUS } from "../utils/httpsStatusCode.utils";

const { expiresIn, secret } = config.jwt;

class SessionService {
  async login(user: logintypes) {
    loginParams.parse({ ...user });

    const find = await userModel.find({ email: user.email });
    if (!find) throw new HttpError("Authentication failed", HTTP_STATUS.UNAUTHORIZED);
    if (!(await handleUserPass.comparePass(user.password, find.password))) throw new HttpError("Authentication failed", HTTP_STATUS.UNAUTHORIZED);

    const token = jwt.sign({ id: find.id, role: find.role }, secret, { expiresIn });
    if (!token) throw new HttpError("Session expired. Please log in again", HTTP_STATUS.UNAUTHORIZED);

    const { email, id, firstName, lastName, role } = find;
    const sendUser = { email, id, firstName, lastName, role };

    return { user: sendUser, token }
  }


  async addUser({ payload, reqUser }: { payload: createUserTypes, reqUser: User }) {

    createUserParams.parse({ ...payload });
    jwtUserParams.parse({ ...reqUser });

    if (!UserPolicy.canAdd(reqUser, payload.role)) throw new HttpError('You do not have authorization to perform this action!', HTTP_STATUS.UNAUTHORIZED);

    if (payload.password) payload.password = await handleUserPass.generateHash({ password: payload.password });

    const sanitize: createUserTypes = {
      email: payload.email.trim(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      role: payload.role,
      password: payload.password
    }

    return await userModel.addUser({ ...sanitize });
  }
}

export const sessionService = new SessionService();