import { userModel } from "../model/user.model";
import { jwtUserParams } from "../types/session.types";
import { createUserParams, type createUserTypes, updateUserParams, type updateUserTypes, userId } from "../types/user.types";
import { handleUserPass } from "../utils/handleUserPass.util";
import { UserPolicy } from "../policies/user.policy";
import type { Roles, User } from '../generated/client';
import { cursorPaginationsParams, cursorParams, decodeCursor, encodeCursor, cursorObjTypes, cursorObj } from "../types/cursorPagination.types";

import { UserWhereInput } from '../generated/models';

import { config } from '../config/system.config';
const defaultPaginationsParams = config.pagination;
class UserService {
  async create(userQuery: createUserTypes) {
    createUserParams.parse({ ...userQuery });

    const findUser = await userModel.find({ email: userQuery.email });
    if (findUser) throw new Error('Usuario ja cadastrado!');

    const hashPass = await handleUserPass.generateHash({ password: userQuery.password });
    if (!hashPass) throw new Error('Error ao gerar o hashPass!');

    const create = await userModel.create({ ...userQuery, password: hashPass });
    if (!create) throw new Error('Nao foi possivel criar o usuario!');

    return create;
  }

  async list(reqUser: User, pagination: cursorPaginationsParams) {
    jwtUserParams.parse(reqUser);
    const valitedCursor = cursorParams.parse(pagination);

    let nextCursorObj: cursorObjTypes | undefined = undefined;
    let where: UserWhereInput | undefined = undefined;

    if (!UserPolicy.canList(reqUser)) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    if (valitedCursor.cursor) nextCursorObj = cursorObj.parse(decodeCursor(valitedCursor.cursor));

    if (reqUser.role === 'ADMIN') where = { role: { in: ['FREEBIE', 'SUBSCRIBER'] } };

    const limit = valitedCursor.limit ?? defaultPaginationsParams.limit;
    const result = await userModel.list({ limit, cursor: nextCursorObj, where });

    const nextCursor = result.length <= limit ? null : result[limit];

    return {
      data: result.slice(0, limit),
      hasNext: !!nextCursor,
      nextCursor: !nextCursor ? null : encodeCursor({ id: nextCursor.id, createdAt: nextCursor.createdAt }),
    };
  }

  async find({ findId, reqUser }: { findId: string, reqUser: User }) {
    userId.parse({ id: findId });

    const isSelfView = reqUser.id === findId;

    const targetUser = isSelfView ? reqUser : await userModel.find({ id: findId });
    if (!targetUser) throw new Error('Usuário não encontrado!');

    if (!UserPolicy.canView(reqUser, targetUser)) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    const { id, email, firstName, lastName, createdAt, updatedAt, role } = targetUser;

    const sanitize = { id, email, firstName, lastName, createdAt, updatedAt, role };
    return sanitize;
  }

  async update({ payload, reqUser }: { payload: updateUserTypes, reqUser: User }) {
    userId.parse({ id: reqUser.id });
    updateUserParams.parse({ ...payload });

    const isSelfUpdate = reqUser.id === payload.id;

    const targetUser = isSelfUpdate ? reqUser : await userModel.find({ id: payload.id });
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

    if (payload.status && payload.status !== targetUser.status) {
      if (!UserPolicy.canAssignStatus(reqUser, targetUser)) throw new Error('Você não tem autorização para alterar o status deste usuário!');
      sanitizePayload.status = payload.status;
    }

    return await userModel.update(sanitizePayload);
  }

  async reactivate({ findId, reqUser }: { findId: string, reqUser: User }) {
    userId.parse({ id: findId });

    const isSelfReactivation = findId === reqUser.id;

    const targetUser = isSelfReactivation ? reqUser : await userModel.find({ id: findId });
    if (!targetUser) throw new Error('Usuário não encontrado!');

    if (!UserPolicy.canAssignStatus(reqUser, targetUser)) throw new Error('Você não tem autorização para remover este usuário!');
    return await userModel.reactivate(findId);
  }

  async delete({ findId, reqUser }: { findId: string, reqUser: User }) {
    userId.parse({ id: findId });

    const isSelfDelete = reqUser.id === findId;

    const targetUser = isSelfDelete ? reqUser : await userModel.find({ id: findId });
    if (!targetUser) throw new Error('Usuário não encontrado!');

    if (!UserPolicy.canDelete(reqUser, targetUser)) throw new Error('Você não tem autorização para remover este usuário!');

    return await userModel.delete(findId);
  }
}


export const userService = new UserService();