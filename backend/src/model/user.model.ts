import { db } from '../config/db.config';
import { createUserTypes, updateUserTypes } from '../types/user.types';

const userDb = db.user;

class User {
  create(newUser: createUserTypes) {
    return userDb.create({ data: { ...newUser, role: 'FREEBIE' }, select: { id: true, email: true } });
  }

  find({ email, id }: { email?: string, id?: string }) {
    return userDb.findFirst({ where: { OR: [{ email }, { id }] } })
  }

  list() {
    return userDb.findMany({ take: 20, omit: { password: true } });
  }

  delete(id: string) {
    return userDb.delete({ where: { id } });
  }

  update(updateUser: updateUserTypes) {
    return userDb.update({ where: { id: updateUser.id }, data: { ...updateUser }, select: { id: true, email: true } });
  }
}

export const UserModel = new User();