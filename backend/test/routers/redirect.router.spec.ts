import type { createShortURLType } from "../../src/types/shortUrl.types";
import type { createUserTypes } from "../../src/types/user.types";
import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";

import { db } from '../../src/config/db.config';
import App from '../../src/app';
import request from 'supertest';

const userDb = db.user;
const shortUrlDb = db.shortUrl;

describe('Redirect Router', () => {
  describe('/:shortCode', () => {
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

    it('should redirect to the original URL when accessing a short URL', async () => {
      expect(typeof shortUrl).toEqual('string');
      expect(shortUrl.length).toBeGreaterThan(1);

      const result = await request(App).get('/api/v1/r/' + shortUrl).expect(302);

      expect(result.headers.location).toBe(testPayload.originalUrl);
    })

    it('should return a NOT_FOUND error when accessing a non-existent short URL', async () => {
      const result = await request(App).get('/api/v1/r/abc');
      expect(result.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
      expect(result.body.success).toEqual(false);
      expect(result.body.message).toEqual('Error redirecting URL');
      expect(result.body.details).toEqual('URL not found!');
    })

    it('should return a FORBIDDEN error when accessing a UNACTIVE short URL', async () => {
      await shortUrlDb.update({ where: { shortUrl }, data: { status: 'UNACTIVE' } });
      const result = await request(App).get('/api/v1/r/' + shortUrl);

      expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
      expect(result.body.success).toEqual(false);
      expect(result.body.message).toEqual('Error redirecting URL');
      expect(result.body.details).toEqual('Selected URL is disabled!');
    })

    it('should return a GONE error when accessing a EXPIRED short URL', async () => {
      await shortUrlDb.update({ where: { shortUrl }, data: { status: 'EXPIRED' } });
      const result = await request(App).get('/api/v1/r/' + shortUrl);

      expect(result.statusCode).toBe(HTTP_STATUS.GONE);
      expect(result.body.success).toEqual(false);
      expect(result.body.message).toEqual('Error redirecting URL');
      expect(result.body.details).toEqual('Selected URL has expired!');
    })
  });
});