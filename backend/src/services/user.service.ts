import { UserModel } from "../model/user.model";
import { jwtUserParams } from "../types/session.types";
import { createUserParams, type createUserTypes, updateUserParams, type updateUserTypes, userId } from "../types/user.types";
import { handleUserPass } from "../utils/handleUserPass.util";
import { UserPolicy } from "../policies/user.policy";
import type { User } from '../generated/client';

class UserServices {
  async create(userQuery: createUserTypes) {
    createUserParams.parse({ ...userQuery });

    const findUser = await UserModel.find({ email: userQuery.email });
    if (findUser) throw new Error('Usuario ja cadastrado!');

    const hashPass = await handleUserPass.generateHash({ password: userQuery.password });
    if (!hashPass) throw new Error('Error ao gerar o hashPass!');

    const create = await UserModel.create({ ...userQuery, password: hashPass });
    if (!create) throw new Error('Nao foi possivel criar o usuario!');

    return create;
  }

  async list(reqUser: User) {
    jwtUserParams.parse(reqUser);

    if (!UserPolicy.canList(reqUser)) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    return await UserModel.list();
  }

  async find({ findId, reqUser }: { findId: string, reqUser: User }) {
    userId.parse({ id: findId });

    const isSelfView = reqUser.id === findId;

    const targetUser = isSelfView ? reqUser : await UserModel.find({ id: findId });
    if (!targetUser) throw new Error('Usuário não encontrado!');

    if (!UserPolicy.canView(reqUser, targetUser)) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    const { id, email, firstName, lastName, createAt, updateAt, role } = targetUser;

    const sanitize = { id, email, firstName, lastName, createAt, updateAt, role };
    return sanitize;
  }

  async update({ payload, reqUser }: { payload: updateUserTypes, reqUser: User }) {
    userId.parse({ id: reqUser.id });
    updateUserParams.parse({ ...payload });

    const isSelfUpdate = reqUser.id === payload.id;

    const targetUser = isSelfUpdate ? reqUser : await UserModel.find({ id: payload.id });
    if (!targetUser) throw new Error('Usuário não encontrado!');

    if (!UserPolicy.canUpdate(reqUser, targetUser)) throw new Error('Você não tem autorização para atualizar este usuário!');

    const sanitizePayload: updateUserTypes = { id: payload.id };

    if (payload.email) sanitizePayload.email = payload.email.trim();
    if (payload.firstName) sanitizePayload.firstName = payload.firstName.trim();
    if (payload.lastName) sanitizePayload.lastName = payload.lastName.trim();
    if (payload.password) sanitizePayload.password = await handleUserPass.generateHash({ password: payload.password });

    if (payload.role && payload.role !== targetUser.role) {
      if (!UserPolicy.canChangeRole(reqUser, targetUser)) throw new Error('Você não tem autorização para alterar o papel deste usuário!');
      sanitizePayload.role = payload.role;
    }

    return await UserModel.update(sanitizePayload);
  }

  async delete({ findId, reqUser }: { findId: string, reqUser: User }) {
    userId.parse({ id: findId });

    const isSelfDelete = reqUser.id === findId;

    const targetUser = isSelfDelete ? reqUser : await UserModel.find({ id: findId });
    if (!targetUser) throw new Error('Usuário não encontrado!');

    if (!UserPolicy.canDelete(reqUser, targetUser)) throw new Error('Você não tem autorização para remover este usuário!');

    return await UserModel.delete(findId);
  }
}


export const UserService = new UserServices();