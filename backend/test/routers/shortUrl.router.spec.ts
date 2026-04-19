import type { createShortURLType } from "../../src/types/shortUrl.types";
import type { createUserTypes } from "../../src/types/user.types";
import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";

import { db } from '../../src/config/db.config';
import App from '../../src/app';
import request from 'supertest';
import { Roles } from "../../src/generated/enums";

const userDb = db.user;
const shortUrlDb = db.shortUrl;

describe('ShortURL Router', () => {
  /* [...router]/api/v1/urls */
  const getToken = async ({ email, password }: { email: string, password: string }) => {
    let token: string = '';
    const loginResponse = await request(App).post('/api/v1/sessions/login').send({ email, password });
    if (loginResponse.statusCode === HTTP_STATUS.OK && loginResponse.body.success) token = loginResponse.body.data.token;
    return token;
  }

  const generateUser = (name: string, role?: Roles): createUserTypes => {
    return {
      email: 'jest' + name + 'test@example.com',
      password: 'Abc@1234',
      firstName: name,
      lastName: 'LastName',
      role: role ?? 'FREEBIE'
    }
  }

  const testPayload: createShortURLType = {
    originalUrl: 'https://dsouza.com.br/'
  };

  const testUser = generateUser('maria', 'FREEBIE');
  const targetUser = generateUser('jack', 'ADMIN');
  const fakeShortUrl = 'shorturltest1234567';

  let token: string = '';
  let shortUrl: string = '';
  let targetId: string = '';

  beforeAll(async () => {
    const [createUser, createdTarget] = await Promise.all([
      request(App).post('/api/v1/users').send(testUser),
      userDb.create({ data: targetUser }),
    ]);

    targetId = createdTarget.id;

    await shortUrlDb.create({ data: { originalUrl: 'https://dsouza.com.br/', shortUrl: fakeShortUrl, userId: targetId } });
    token = await getToken({ email: testUser.email, password: testUser.password });

    if (token) {
      const createURl = await request(App).post('/api/v1/urls').send(testPayload).set('Authorization', `Bearer ${token}`);
      if (createURl.statusCode === HTTP_STATUS.CREATED && createURl.body.data) shortUrl = createURl.body.data.shortUrl;
    }
  });

  afterAll(async () => {
    await userDb.deleteMany({ where: { email: { startsWith: 'jest' } } });
  })

  describe('POST /', () => {

    it('should create a short URL for an authenticated user', async () => {
      expect(typeof shortUrl).toEqual('string');
      expect(shortUrl.length).toBeGreaterThan(1);

      const result = await request(App).post('/api/v1/urls').send(testPayload).set('Authorization', `Bearer ${token}`);
      expect(result.statusCode).toEqual(HTTP_STATUS.CREATED);
    })

    it('should return forbidden when a FREEBIE user exceeds the short URL creation limit', async () => {
      expect(typeof shortUrl).toEqual('string');
      expect(shortUrl.length).toBeGreaterThan(1);

      await Promise.all([
        request(App).post('/api/v1/urls').send(testPayload).set('Authorization', `Bearer ${token}`),
        request(App).post('/api/v1/urls').send(testPayload).set('Authorization', `Bearer ${token}`),
      ])

      const result = await request(App).post('/api/v1/urls').send(testPayload).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toEqual(HTTP_STATUS.FORBIDDEN);
      expect(result.body.success).toBe(false);
      expect(result.body.message).toEqual("Error creating short URL!");
      expect(result.body.details).toEqual("You do not have authorization to perform this action!");
    })
  });

  describe('GET /:shortUrl', () => {
    it('should return not found when requesting a non-existent short URL', async () => {
      const result = await request(App).get('/api/v1/urls/abc').set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.NOT_FOUND);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('details');
      expect(result.body).toHaveProperty('success');

      expect(result.body.message).toEqual("Error finding short URL");
      expect(result.body.details).toEqual("Short URL not found!");
      expect(result.body.success).toBe(false);
    })

    it('should return short URL details when the resource belongs to the authenticated user', async () => {
      const result = await request(App).get('/api/v1/urls/' + shortUrl).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.OK);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('data');
      expect(result.body.data).toHaveProperty('shortUrl');

      expect(result.body.success).toBe(true);
      expect(result.body.message).toEqual('Short URL found!');
      expect(result.body.data.shortUrl).toBe(shortUrl);
    })

    it("should return forbidden when a non-admin user tries to access another user's short URL", async () => {
      const result = await request(App).get('/api/v1/urls/' + fakeShortUrl).set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(HTTP_STATUS.FORBIDDEN);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('details');
      expect(result.body).toHaveProperty('success');

      expect(result.body.success).toEqual(false);
      expect(result.body.message).toEqual('Error finding short URL');
      expect(result.body.details).toEqual('You do not have authorization to perform this action!');
    });
  })

  describe('PATCH /:shortUrl', () => {
    it('should return not found when updating a non-existent short URL', async () => {
      const result = await request(App).patch('/api/v1/urls/abc').send(testPayload).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.NOT_FOUND);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('details');
      expect(result.body).toHaveProperty('success');

      expect(result.body.message).toEqual("Error updating short URL");
      expect(result.body.details).toEqual("Short URL not found!");
      expect(result.body.success).toBe(false);
    })

    it("should return forbidden when updating another user's short URL", async () => {
      await shortUrlDb.update({ where: { shortUrl: shortUrl }, data: { status: 'ACTIVE' } });
      const result = await request(App).patch('/api/v1/urls/' + fakeShortUrl).send(testPayload).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.message).toEqual("Error updating short URL");
      expect(result.body.details).toEqual('You do not have authorization to perform this action!');
    })

    it("should update the short URL successfully", async () => {
      await shortUrlDb.update({ where: { shortUrl: shortUrl }, data: { status: 'ACTIVE' } });
      const result = await request(App).patch('/api/v1/urls/' + shortUrl).send({ ...testPayload, expiresAt: '2046-04-17T02:31:24.272Z', status: 'UNACTIVE' }).set('Authorization', `Bearer ${token}`);

      console.log("Result: ", result.body);

      expect(result.statusCode).toBe(HTTP_STATUS.OK);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('data');

      expect(result.body.success).toBe(true);
      expect(result.body.message).toEqual("Short URL updated!");
    })
  })

  describe('GET /', () => {
    let nextCursor: string = '';

    it("should list authenticated user's short URLs", async () => {
      const result = await request(App).get('/api/v1/urls/?limit=1').set('Authorization', `Bearer ${token}`);

      nextCursor = result.body?.data?.nextCursor;

      expect(result.statusCode).toBe(HTTP_STATUS.OK);

      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('data');

      expect(result.body.success).toBe(true);
      expect(result.body.message).toBe('Short URLs listed successfully!');

      expect(result.body.data).toHaveProperty('data');
      expect(result.body.data).toHaveProperty('hasNext');
      expect(result.body.data).toHaveProperty('nextCursor');
    });

    it('should list short URLs using cursor pagination', async () => {
      const result = await request(App).get('/api/v1/urls/?limit=1&cursor=' + nextCursor).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.OK);

      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('data');

      expect(result.body.success).toBe(true);
      expect(result.body.message).toBe('Short URLs listed successfully!');

      expect(result.body.data).toHaveProperty('data');
      expect(result.body.data).toHaveProperty('hasNext');
      expect(result.body.data).toHaveProperty('nextCursor');
    });

    it("should return forbidden when a non-admin user tries to list another user's URLs", async () => {
      const result = await request(App).get('/api/v1/urls/?userId=' + targetId).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN);

      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.message).toBe('Error listing short URLs');
      expect(result.body.details).toBe('You do not have authorization to perform this action!');
    });

    it('should return bad request when an invalid userId is provided', async () => {
      const result = await request(App).get('/api/v1/urls/?userId=abc').set('Authorization', `Bearer ${token}`);
      console.log("Result: ", result);

      expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);

      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.message).toBe('Error listing short URLs');
      expect(result.body.details).toBe('Invalid ID passed!');
    });
  })

  describe('DELETE /:shortUrl', () => {
    it('should return not found when deleting a non-existent short URL', async () => {
      const result = await request(App).delete('/api/v1/urls/abc').set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.NOT_FOUND);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('details');
      expect(result.body).toHaveProperty('success');

      expect(result.body.message).toEqual("Error deleting short URL");
      expect(result.body.details).toEqual("Short URL not found!");
      expect(result.body.success).toBe(false);
    })

    it('should return forbidden when deleting an active short URL', async () => {
      await shortUrlDb.update({ where: { shortUrl: shortUrl }, data: { status: 'ACTIVE' } });
      const result = await request(App).delete('/api/v1/urls/' + shortUrl).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.message).toEqual("Error deleting short URL");
      expect(result.body.details).toEqual('Active URLs cannot be removed. Deactivate before deleting.');
    })

    it("should return forbidden when deleting another user's short URL", async () => {
      await shortUrlDb.update({ where: { shortUrl: fakeShortUrl }, data: { status: 'EXPIRED' } });
      const result = await request(App).delete('/api/v1/urls/' + fakeShortUrl).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN);

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.message).toEqual("Error deleting short URL");
      expect(result.body.details).toEqual("You do not have authorization to perform this action!");
    })

    it('should delete an expired short URL successfully', async () => {
      await shortUrlDb.update({ where: { shortUrl: shortUrl }, data: { status: 'EXPIRED' } });

      const result = await request(App).delete('/api/v1/urls/' + shortUrl).set('Authorization', `Bearer ${token}`);
      expect(result.statusCode).toBe(HTTP_STATUS.NO_CONTENT);
    })
  })
});