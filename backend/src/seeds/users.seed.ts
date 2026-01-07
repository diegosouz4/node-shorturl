import { db } from '../config/db.config';
import { faker } from '@faker-js/faker';
import type { createUserTypes } from '../types/user.types';
import { hash } from 'bcrypt';
import { Roles } from '../generated/client';
import { ShortUrlCreateInput, ShortUrlCreateManyInput } from '../generated/models';
import { generateShortURL } from '../utils/generateShortURL.util';
const userDb = db.user;
const shortUrlDb = db.shortUrl;

const masterUser: createUserTypes = {
  email: "anna@doe.com.br",
  firstName: "Anna",
  lastName: "Doe",
  password: "Abc@1234",
  role: "MASTER"
}

const allRoles: Roles[] = ['FREEBIE', 'SUBSCRIBER', 'ADMIN', 'MASTER'];

class Seed {
  generateUsers() {
    const user: createUserTypes = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      // password: faker.internet.password(),
      password: 'Abc@1234',
      role: allRoles[Math.floor(Math.random() * allRoles.length)]
    }
    return user;
  }

  async generateUrl(id: string) {
    const url: ShortUrlCreateManyInput = {
      originalUrl: faker.internet.domainName(),
      shortUrl: '',
      userId: id
    }

    for (let i = 0; i < 20; i++) {
      const short = generateShortURL(7);
      const exist = await shortUrlDb.findUnique({ where: { shortUrl: short } })

      if (!exist) {
        url.shortUrl = short;
        break;
      };
    }

    return url;
  }

  async updatePass(arr: createUserTypes[]) {
    for (let i = 0; i < arr.length; i++) {
      arr[i].password = await hash(arr[i].password, 8);
    }

    return arr;
  }

  async seedUsers() {
    try {
      await Promise.all([
        userDb.deleteMany(),
        shortUrlDb.deleteMany(),
      ]);

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

  async seedShortUrl() {
    try {
      const listUsers = await userDb.findMany({ take: 30 });
      if (!listUsers || listUsers.length < 1) return;

      for (let i = 0; i < listUsers.length; i++) {
        const quantity = Math.floor(Math.random() * 20);
        const currentUser = listUsers[i];
        let urls:ShortUrlCreateManyInput[] = [];
        for (let x = 0; x < quantity; x++) {
          const single = await this.generateUrl(currentUser.id);
          urls.push(single);
        } 

        if(urls.length !== 0) {
          await shortUrlDb.createMany({data: urls});
        }
      }


    } catch (err: unknown) {
      let details = '';
      if (err instanceof Error) details = err.message;
      console.log(`[seedShortUrls] Erro ao gerar seed!. Erro: ${details}`);
    }
  }
}

export const seedUsers = new Seed();