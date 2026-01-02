import { UserModel } from "../model/user.model";
import { jwtUserParams, type jwtUsertypes } from "../types/session.types";
import { createUserParams, createUserTypes, userId } from "../types/user.types";
import { checkPermision } from "../utils/checkPermision.util";
import { handleUserPass } from "../utils/handleUserPass.util";

class User {
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

  async list(user: jwtUsertypes) {
    jwtUserParams.parse(user);
    const reqUser = await UserModel.find({ id: user.id });

    if (!reqUser || reqUser.role !== user.role) throw new Error('Usuário inválido!');
    if (!checkPermision(reqUser.role)) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    const users = await UserModel.list();
    return users;
  }

  async find({ findId, user }: { findId: string, user: jwtUsertypes }) {
    userId.parse({ id: findId });
    const reqUser = await UserModel.find({ id: user.id });

    if (!reqUser || reqUser.role !== user.role) throw new Error('Usuário inválido!');
    if (!checkPermision(reqUser.role, ['FREEBIE', 'SUBSCRIBER', 'ADMIN', 'MASTER'])) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    if (reqUser.id !== findId && !['ADMIN', 'MASTER'].includes(reqUser.role)) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    const findeduser = await UserModel.find({ id: findId });
    if (!findeduser) throw new Error('Usuário não encontrado!');

    if (reqUser.role === 'ADMIN' && reqUser.id !== findId && ['ADMIN', 'MASTER'].includes(findeduser.role)) throw new Error('Perfil do tipo admin só pode verificar perfis abaixo de admin!');

    const { id, email, firstName, lastName, createAt, updateAt, role } = findeduser;

    const sanitize = { id, email, firstName, lastName, createAt, updateAt, role };
    return sanitize;
  }

  async delete({ findId, user }: { findId: string, user: jwtUsertypes }) {
    userId.parse({ id: findId });
    const reqUser = await UserModel.find({ id: user.id });

    if (!reqUser || reqUser.role !== user.role) throw new Error('Usuário inválido!');
    if (!checkPermision(reqUser.role, ['ADMIN', 'MASTER'])) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    if (findId === user.id) throw new Error('Usuário não pode se auto deletar!');

    const findeduser = await UserModel.find({ id: findId });
    if (!findeduser) throw new Error('Usuário não encontrado!');

    if (reqUser.role === 'ADMIN' && ['ADMIN', 'MASTER'].includes(findeduser.role)) throw new Error('Perfil do tipo admin só pode remover perfis abaixo de admin!');
    if (reqUser.role === 'MASTER' && findeduser.role === 'MASTER') throw new Error('Perfil do tipo master só pode remover perfis abaixo de master!');

    return await UserModel.delete(findId);
  }
}


export const UserService = new User();