import type { createShortURLType } from "../../src/types/shortUrl.types";
import type { createUserTypes } from "../../src/types/user.types";
import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";

import { db } from '../../src/config/db.config';
import App from '../../src/app';
import request from 'supertest';

const userDb = db.user;
const shortUrlDb = db.shortUrl;

describe('ShortURL Router', () => {
  /* [...router]/api/v1/urls */

  const testPayload: createShortURLType = {
    originalUrl: 'https://dsouza.com.br/'
  };

  const testUser: createUserTypes = {
    email: 'test@example.com',
    password: 'Abc@1234',
    firstName: 'TesteUser',
    lastName: 'LastName',
    role: 'FREEBIE'
  }

  let token: string = '';
  let shortUrl: string = '';

  describe('POST /', () => {
    beforeAll(async () => {
      let findUser = await userDb.findFirst({ where: { email: testUser.email } });
      if (!findUser) await request(App).post('/api/v1/users').send(testUser);

      const getToken = await request(App).post('/api/v1/sessions/login').send({ email: testUser.email, password: testUser.password });
      if (getToken.statusCode === HTTP_STATUS.OK && getToken.body.success) token = getToken.body.data.token;

      if (token) {
        const createURl = await request(App).post('/api/v1/urls').send(testPayload).set('Authorization', `Bearer ${token}`);
        if (createURl.statusCode === HTTP_STATUS.CREATED && createURl.body.data) {
          shortUrl = createURl.body.data.shortUrl;
        }
      }
    });

    afterAll(async () => {
      await Promise.all([
        userDb.delete({ where: { email: testUser.email } }),
        shortUrlDb.deleteMany({ where: { shortUrl: shortUrl } }),
      ])
    })

    it('should create short url', async () => {
      expect(typeof shortUrl).toEqual('string');
      expect(shortUrl.length).toBeGreaterThan(1);

      const result = await request(App).post('/api/v1/urls').send(testPayload).set('Authorization', `Bearer ${token}`);

      console.log(result.body);

      expect(result.statusCode).toEqual(HTTP_STATUS.CREATED);
    })
  });
});