import { db } from '../config/db.config';
import { faker } from '@faker-js/faker';
import { createUserTypes } from '../types/user.types';
import { hash } from 'bcrypt';
import { UserCreateInput } from '../generated/models';

const userDb = db.user;

const masterUser: createUserTypes = {
  email: "anna@doe.com.br",
  firstName: "Anna",
  lastName: "Doe",
  password: "Abc@1234",
  role: "MASTER"
}

class Seed {
  generateUsers() {
    const user: createUserTypes = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'FREEBIE'
    }
    return user;
  }

  async updatePass(arr: createUserTypes[]) {
    for (let i = 0; i < arr.length; i++) {
      arr[i].password = await hash(arr[i].password, 8);
    }

    return arr;
  }

  async seedUsers() {
    try {
      await userDb.deleteMany();
      const arrUsers = faker.helpers.multiple(this.generateUsers, { count: 50 })
      if (!arrUsers || arrUsers.length < 1) return null;

      await this.updatePass(arrUsers);
      masterUser.password = await hash(masterUser.password, 8);

      await Promise.all([
        userDb.createMany({ data: arrUsers, skipDuplicates: true }),
        userDb.create({ data: masterUser })
      ]);

      console.log("Sucesso ao gerar o seed de usuarios!")
      return arrUsers;
    } catch (err: unknown) {
      let details = '';
      if (err instanceof Error) details = err.message;
      console.log(`[seedUsers] Erro ao gerar seed!. Erro: ${details}`);
    }
  }
}

export const seedUsers = new Seed();