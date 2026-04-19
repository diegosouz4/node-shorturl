import { db } from '../../src/config/db.config';
import App from '../../src/app';
import request from 'supertest';

import { HTTP_STATUS } from '../../src/utils/httpsStatusCode.utils';
import { handleUserPass } from '../../src/utils/handleUserPass.util';

import type { createUserTypes } from '../../src/types/user.types';
import type { Roles } from '../../src/generated/enums';

const userDb = db.user;

describe('User router', () => {

  /* [...router]/api/v1/users */

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

  let token: string = '';
  let targetId: string = '';
  const testUser = generateUser('jhon');
  const targetUser = generateUser('maria');


  beforeAll(async () => {
    const findTestUser = await userDb.findFirst({ where: { email: testUser.email } });
    if (!findTestUser) await userDb.create({ data: { ...testUser, password: await handleUserPass.generateHash({ password: testUser.password }) } });
    if (findTestUser && findTestUser.role !== testUser.role) await userDb.update({ where: { email: testUser.email }, data: { role: 'FREEBIE' } })

    token = await getToken({ email: testUser.email, password: testUser.password });
  });

  afterAll(async () => {
    await userDb.deleteMany({ where: { email: { startsWith: 'jest' } } });
  });

  describe('POST /', () => {
    it('should create a new users as freebie', async () => {
      const newUser = generateUser('newUser', 'SUBSCRIBER');
      const result = await request(App).post('/api/v1/users').send(newUser).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.CREATED);
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('data');
      expect(result.body.data).toHaveProperty('email');

      expect(result.body.success).toBe(true);
      expect(result.body.data.email).toEqual(newUser.email);
    })

    it('should return 400 when try create a new user with email already registered', async () => {
      const result = await request(App).post('/api/v1/users').send(testUser).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.CONFLICT);
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.details).toBe('User already registered!');
    })
  });

  describe('GET /:id', () => {
    it('should return 400 when id is invalid', async () => {
      const result = await request(App).get('/api/v1/users/abc').set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.details).toBe('Invalid user ID!');
    })

    it('should return 404 when user not exist', async () => {
      const result = await request(App).get('/api/v1/users/cc735884-995a-4d31-966d-36be9efc9eb7').set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.details).toBe('User not found!');
    })

    it('should return error when user no admin try to get another user info', async () => {
      const { email, firstName, lastName, password, role } = targetUser;
      const target = await userDb.create({ data: { email, firstName, lastName, password, role: 'ADMIN' } });
      const result = await request(App).get('/api/v1/users/' + target?.id).set('Authorization', `Bearer ${token}`);

      targetId = target.id;

      expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('details');

      expect(result.body.success).toBe(false);
      expect(result.body.details).toBe("You do not have authorization to perform this action!");
    })

    it('should return find itself when id is the same as requester id', async () => {
      const target = await userDb.findFirst({ where: { email: testUser.email } });
      const result = await request(App).get('/api/v1/users/' + target?.id).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.OK);
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('data');

      expect(result.body.success).toBe(true);
    })

    it('should return a user', async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'MASTER' } });
      token = await getToken({ email: testUser.email, password: testUser.password });

      const result = await request(App).get('/api/v1/users/' + targetId).set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(HTTP_STATUS.OK);
      expect(result.body).toHaveProperty('success');
      expect(result.body).toHaveProperty('data');

      expect(result.body.success).toBe(true);
    })
  });

  describe('PATCH /:id', () => {
    let patchTargetId = '';
    const payload = generateUser('patchPayload', 'MASTER');

    beforeAll(async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'FREEBIE' } });
      token = await getToken({ email: testUser.email, password: testUser.password });

      const { email, firstName, lastName, password, role } = generateUser('patchUser', 'ADMIN')
      const target = await userDb.create({ data: { email, firstName, lastName, password, role: 'ADMIN' }, select: { id: true } });
      patchTargetId = target.id;
    });

    it('should return NOTFOUND if user not found', async () => {
      const result = await request(App).patch('/api/v1/users/1361ca92-5215-4245-babb-427cd0804b70').send({}).set('Authorization', `Bearer ${token}`);
      expect(result.statusCode).toBe(HTTP_STATUS.NOT_FOUND);

      expect(result.body).toHaveProperty('details');
      expect(result.body).toHaveProperty('success');

      expect(result.body.details).toBe("User not found!");
      expect(result.body.success).toBe(false);
    });

    it('should return FORBIDEN when user no admin try to update another user info ', async () => {
      const result = await request(App).patch('/api/v1/users/' + patchTargetId).send(payload).set('Authorization', `Bearer ${token}`);
      expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN);

      expect(result.body).toHaveProperty('details');
      expect(result.body).toHaveProperty('success');

      expect(result.body.details).toBe("You do not have authorization to update this user!");
      expect(result.body.success).toBe(false);
    });

    it('should return OK when admin try to update another user info ', async () => {
      await Promise.all([
        userDb.update({ where: { email: testUser.email }, data: { role: 'ADMIN' } }),
        userDb.update({ where: { id: patchTargetId }, data: { role: 'SUBSCRIBER' } }),
      ]);

      token = await getToken({ email: testUser.email, password: testUser.password });

      const result = await request(App).patch('/api/v1/users/' + patchTargetId).send({...payload, status: "UNACTIVE"}).set('Authorization', `Bearer ${token}`);
      expect(result.statusCode).toBe(HTTP_STATUS.OK);

      console.log("Result: ", result.body)

      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('success');

      expect(result.body.message).toBe("User updated successfully");
      expect(result.body.success).toBe(true);
    });
  })
});