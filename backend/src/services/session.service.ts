import { UserModel } from "../model/user.model";
import { type logintypes, loginParams } from "../types/session.types";
import { createUserParams, createUserTypes } from "../types/user.types";
import { handleUserPass } from "../utils/handleUserPass.util";

import jwt from 'jsonwebtoken';
import { config } from '../config/system.config';

const { expiresIn, secret } = config.jwt;

class Session {
  async login(user: logintypes) {
    loginParams.parse({ ...user });

    const find = await UserModel.find({ email: user.email });
    if (!find) throw new Error('Usuario nao cadastrado!');
    if (!(await handleUserPass.comparePass(user.password, find.password))) throw new Error('Senha invalida!');

    const token = jwt.sign({ id: find.id, role: find.role }, secret, { expiresIn });
    if (!token) throw new Error("Erro ao gerar token de acesso!");

    const { email, id, firstName, lastName, role } = find;
    const sendUser = { email, id, firstName, lastName, role };

    return { user: sendUser, token }
  }


  async create({ email, firstName, lastName, password, role }: createUserTypes) {
    createUserParams.parse({ email, firstName, lastName, password, role });
    const hashPass = await handleUserPass.generateHash({ password });

    return { email, firstName, lastName, password: hashPass, role }
  }
}

export const SessionService = new Session();