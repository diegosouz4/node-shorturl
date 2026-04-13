import { db } from '../config/db.config';
import { config } from '../config/system.config';
import { cursorObjTypes, cursorPaginationsParams } from '../types/cursorPagination.types';
import { createUserTypes, updateUserTypes } from '../types/user.types';

import { UserWhereInput } from '../generated/models';

const userDb = db.user;
const defaultPaginationsParams = config.pagination;

class UserModel {
  create(newUser: createUserTypes) {
    return userDb.create({ data: { ...newUser, role: 'FREEBIE' }, select: { id: true, email: true } });
  }

  addUser(newUser: createUserTypes) {
    return userDb.create({ data: { ...newUser }, select: { id: true, email: true } });
  }

  find({ email, id }: { email?: string, id?: string }) {
    return userDb.findFirst({ where: { OR: [{ email }, { id }] } })
  }

  list({ cursor, limit, where }: { limit: number, cursor?: cursorObjTypes, where?: UserWhereInput }) {
    const take = limit ? Number(limit) : defaultPaginationsParams.limit;

    return userDb.findMany({
      take: take + 1,
      skip: !cursor || !cursor.id ? 0 : 1,
      where,
      orderBy: { createdAt: 'desc' },
      omit: { password: true },
      cursor: !cursor || !cursor.id ? undefined : {
        id: cursor.id
      }
    });

  }

  reactivate(id: string) {
    return userDb.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  delete(id: string) {
    return userDb.update({ where: { id }, data: { status: 'DELETED' } });
  }

  update(updateUser: updateUserTypes) {
    return userDb.update({ where: { id: updateUser.id }, data: { ...updateUser }, select: { id: true, email: true } });
  }
}

export const userModel = new UserModel();