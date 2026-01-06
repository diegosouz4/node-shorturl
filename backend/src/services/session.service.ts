import { type logintypes, jwtUserParams, loginParams } from "../types/session.types";
import type { User } from "../generated/client";
import { userModel } from "../model/user.model";
import { createUserParams, createUserTypes } from "../types/user.types";
import { handleUserPass } from "../utils/handleUserPass.util";

import jwt from 'jsonwebtoken';
import { config } from '../config/system.config';
import { UserPolicy } from "../policies/user.policy";

const { expiresIn, secret } = config.jwt;

class SessionService {
  async login(user: logintypes) {
    loginParams.parse({ ...user });

    const find = await userModel.find({ email: user.email });
    if (!find) throw new Error('Credenciais inválidas');
    if (!(await handleUserPass.comparePass(user.password, find.password))) throw new Error('Credenciais inválidas');

    const token = jwt.sign({ id: find.id, role: find.role }, secret, { expiresIn });
    if (!token) throw new Error("Erro ao gerar token de acesso!");

    const { email, id, firstName, lastName, role } = find;
    const sendUser = { email, id, firstName, lastName, role };

    return { user: sendUser, token }
  }


  async addUser({ payload, reqUser }: { payload: createUserTypes, reqUser: User }) {

    createUserParams.parse({ ...payload });
    jwtUserParams.parse({ ...reqUser });

    if (!UserPolicy.canAdd(reqUser, payload.role)) throw new Error('Você não tem autorização para executar esse tipo de ação!');

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