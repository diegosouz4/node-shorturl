import type { createUserTypes } from "../../src/types/user.types";

import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";
import { handleUserPass } from "../../src/utils/handleUserPass.util";

import { db } from '../../src/config/db.config';
import App from '../../src/app';
import request from 'supertest';
import { logintypes } from "../../src/types/session.types";
import { Roles } from "../../src/generated/enums";

const userDb = db.user;

describe('Session router', () => {
  /* [...router]/api/v1/sessions */

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

  const testUser = generateUser('jhon');
  let token: string = '';

  beforeAll(async () => {
    const findTestUser = await userDb.findFirst({ where: { email: testUser.email } });
    if (!findTestUser) await userDb.create({ data: { ...testUser, password: await handleUserPass.generateHash({ password: testUser.password }) } });
    if (findTestUser && findTestUser.role !== testUser.role) await userDb.update({ where: { email: testUser.email }, data: { role: 'FREEBIE' } })
  });

  afterAll(async () => {
    await userDb.deleteMany({ where: { email: { startsWith: 'jest' } } });
  });

  describe('POST /login', () => {

    it('should return an error for missing request body on login', async () => {
      const payload = {};
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.success).toBe(false);
    })

    it('should return an error for missing password in login request', async () => {
      const payload = { email: 'anna@teste.com' };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toEqual("Error during login!");

      expect(typeof response.body.details).toBe('string');
      expect(response.body.details).toEqual("Password is required");

      expect(response.body.success).toBe(false);
    })

    it('should return an error for missing email in login request', async () => {
      const payload = { password: '123456' };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toEqual("Error during login!");

      expect(typeof response.body.details).toBe('string');
      expect(response.body.details).toEqual("Email is required!");

      expect(response.body.success).toBe(false);
    })

    it('should return an unauthorized status for invalid login credentials', async () => {
      const payload = { password: '123456', email: 'invalid@email.com' };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toEqual("Error during login!");

      expect(typeof response.body.details).toBe('string');
      expect(response.body.details).toEqual("Authentication failed");

      expect(response.body.success).toBe(false);
    })

    it('should return a successful response with a token and user data for valid login credentials', async () => {
      const payload: logintypes = { password: testUser.password, email: testUser.email };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveProperty('token');
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(0);

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toMatchObject({ email: testUser.email, firstName: testUser.firstName, lastName: testUser.lastName, role: testUser.role });
    })

    it('should return an unauthorized status for incorrect password in login request', async () => {
      const payload: logintypes = { password: '1234467', email: testUser.email };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    })
  });

  describe('POST /addUser', () => {

    const targetUser = generateUser('maria');

    beforeAll(async () => {
      token = await getToken({ email: testUser.email, password: testUser.password });
    });

    it('should return a 401 status when no token is provided', async () => {
      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.message).toEqual('Unauthorized access!');
      expect(response.body.success).toBe(false);
    })

    it('should return a 403 status for users without admin privileges', async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'FREEBIE' } });
      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser).set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.message).toEqual('Unauthorized access!');
      expect(response.body.success).toBe(false);
    })

    it('should create a new user when provided with a valid admin token', async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'ADMIN' } });
      token = await getToken({ email: testUser.email, password: testUser.password });
      
      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser).set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(HTTP_STATUS.CREATED);
      expect(response.body.message).toEqual('New user created!');
      expect(response.body.success).toBe(true);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');

      expect(response.body.data.email).toEqual(targetUser.email);
    })

    it('should return a 409 status for duplicate email during user creation', async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'ADMIN' } });
      token = await getToken({ email: testUser.email, password: testUser.password });
      
      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser).set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(HTTP_STATUS.CONFLICT);
      expect(response.body.message).toEqual('Error creating user!');
      expect(response.body.details).toEqual('Duplicate record. Value already exists.');
    })
  })
})
