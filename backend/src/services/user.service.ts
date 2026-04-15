import { userModel } from "../model/user.model";
import { jwtUserParams } from "../types/session.types";
import { createUserParams, type createUserTypes, updateUserParams, type updateUserTypes, userId } from "../types/user.types";
import { handleUserPass } from "../utils/handleUserPass.util";
import { UserPolicy } from "../policies/user.policy";
import type { Roles, User } from '../generated/client';
import { cursorPaginationsParams, cursorParams, decodeCursor, encodeCursor, cursorObjTypes, cursorObj } from "../types/cursorPagination.types";

import { UserWhereInput } from '../generated/models';

import { config } from '../config/system.config';
import { HttpError } from "../utils/httpError.util";
import { HTTP_STATUS } from "../utils/httpsStatusCode.utils";
const defaultPaginationsParams = config.pagination;
class UserService {
  async create(userQuery: createUserTypes) {
    createUserParams.parse({ ...userQuery });

    const findUser = await userModel.find({ email: userQuery.email });
    if (findUser) throw new HttpError('Usuario ja cadastrado!', HTTP_STATUS.CONFLICT);

    const hashPass = await handleUserPass.generateHash({ password: userQuery.password });
    if (!hashPass) throw new HttpError('Error ao gerar o hashPass!', HTTP_STATUS.INTERNAL_SERVER_ERROR);

    const create = await userModel.create({ ...userQuery, password: hashPass });
    if (!create) throw new HttpError('Nao foi possivel criar o usuario!', HTTP_STATUS.INTERNAL_SERVER_ERROR);

    return create;
  }

  async list(reqUser: User, pagination: cursorPaginationsParams) {
    jwtUserParams.parse(reqUser);
    const valitedCursor = cursorParams.parse(pagination);

    let nextCursorObj: cursorObjTypes | undefined = undefined;
    let where: UserWhereInput | undefined = undefined;

    const { isValid, statusCode } = UserPolicy.canList(reqUser);
    if (!isValid) throw new HttpError('Você não tem autorização para executar esse tipo de ação!', statusCode);

    if (valitedCursor.cursor) nextCursorObj = cursorObj.parse(decodeCursor(valitedCursor.cursor));

    if (reqUser.role === 'ADMIN') where = { role: { in: ['FREEBIE', 'SUBSCRIBER'] } };

    const limit = valitedCursor.limit ?? defaultPaginationsParams.limit;
    const result = await userModel.list({ limit, cursor: nextCursorObj, where });

    const nextCursor = result.length <= limit ? null : result[limit - 1];

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
    if (!targetUser) throw new HttpError('Usuário não encontrado!', HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = UserPolicy.canView(reqUser, targetUser);
    if (!isValid) throw new HttpError('Você não tem autorização para executar esse tipo de ação!', statusCode);

    const { id, email, firstName, lastName, createdAt, updatedAt, role } = targetUser;
    const sanitize = { id, email, firstName, lastName, createdAt, updatedAt, role };

    return sanitize;
  }

  async update({ payload, reqUser }: { payload: updateUserTypes, reqUser: User }) {
    userId.parse({ id: reqUser.id });
    updateUserParams.parse({ ...payload });

    const isSelfUpdate = reqUser.id === payload.id;

    const targetUser = isSelfUpdate ? reqUser : await userModel.find({ id: payload.id });
    if (!targetUser) throw new HttpError('Usuário não encontrado!', HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = UserPolicy.canUpdate(reqUser, targetUser);
    if (!isValid) throw new HttpError('Você não tem autorização para atualizar este usuário!', statusCode);

    const sanitizePayload: updateUserTypes = { id: payload.id };

    if (payload.email) sanitizePayload.email = payload.email.trim();
    if (payload.firstName) sanitizePayload.firstName = payload.firstName.trim();
    if (payload.lastName) sanitizePayload.lastName = payload.lastName.trim();
    if (payload.password) sanitizePayload.password = await handleUserPass.generateHash({ password: payload.password });

    if (payload.role && payload.role !== targetUser.role) {
      const { isValid, statusCode } = UserPolicy.canChangeRole(reqUser, targetUser);
      if (!isValid) throw new HttpError('Você não tem autorização para alterar o papel deste usuário!', statusCode);
      sanitizePayload.role = payload.role;
    }

    if (payload.status && payload.status !== targetUser.status) {
      const { isValid, statusCode } = UserPolicy.canAssignStatus(reqUser, targetUser);
      if (!isValid) throw new HttpError('Você não tem autorização para alterar o status deste usuário!', statusCode);
      sanitizePayload.status = payload.status;
    }

    return await userModel.update(sanitizePayload);
  }

  async reactivate({ findId, reqUser }: { findId: string, reqUser: User }) {
    userId.parse({ id: findId });

    const isSelfReactivation = findId === reqUser.id;

    const targetUser = isSelfReactivation ? reqUser : await userModel.find({ id: findId });
    if (!targetUser) throw new HttpError('Usuário não encontrado!', HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = UserPolicy.canAssignStatus(reqUser, targetUser);
    if (!isValid) throw new HttpError('Você não tem autorização para remover este usuário!', statusCode);
    return await userModel.reactivate(findId);
  }

  async delete({ findId, reqUser }: { findId: string, reqUser: User }) {
    userId.parse({ id: findId });

    const isSelfDelete = reqUser.id === findId;

    const targetUser = isSelfDelete ? reqUser : await userModel.find({ id: findId });
    if (!targetUser) throw new HttpError('Usuário não encontrado!', HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = UserPolicy.canDelete(reqUser, targetUser);
    if (!isValid) throw new HttpError('Você não tem autorização para remover este usuário!', statusCode);

    return await userModel.delete(findId);
  }
}


export const userService = new UserService();