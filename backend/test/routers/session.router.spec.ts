import type { createUserTypes } from "../../src/types/user.types";

import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";
import { handleUserPass } from "../../src/utils/handleUserPass.util";

import { db } from '../../src/config/db.config';
import App from '../../src/app';
import request from 'supertest';
import { logintypes } from "../../src/types/session.types";

const userDb = db.user;

describe('Session router', () => {
  /* [...router]/api/v1/sessions */

  describe('POST /login', () => {
    const testUser: createUserTypes = {
      email: 'test@example.com',
      password: 'Abc@1234',
      firstName: 'TesteUser',
      lastName: 'LastName',
      role: 'FREEBIE'
    }

    beforeAll(async () => {
      const findTestUser = await userDb.findFirst({ where: { email: testUser.email } });
      if (!findTestUser) await userDb.create({ data: { ...testUser, password: await handleUserPass.generateHash({ password: testUser.password }) } });
      if (findTestUser && findTestUser.role !== testUser.role) await userDb.update({ where: { email: testUser.email }, data: { role: 'FREEBIE' } })
    });

    afterAll(async () => {
      const findTestUser = await userDb.findFirst({ where: { email: testUser.email } });
      if (findTestUser) await userDb.delete({ where: { email: testUser.email } });
    });

    it('should return error when accessing the login route with no body', async () => {
      const payload = {};
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.success).toBe(false);
    })

    it('should return error when accessing the login route without passing the password', async () => {
      const payload = { email: 'anna@teste.com' };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toEqual("Error during login!");

      expect(typeof response.body.details).toBe('string');
      expect(response.body.details).toEqual("Password is required");

      expect(response.body.success).toBe(false);
    })

    it('should return error when accessing the login route without passing the email', async () => {
      const payload = { password: '123456' };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toEqual("Error during login!");

      expect(typeof response.body.details).toBe('string');
      expect(response.body.details).toEqual("Email is required!");

      expect(response.body.success).toBe(false);
    })

    it('should return error when accessing the login route with invalid credentials', async () => {
      const payload = { password: '123456', email: 'invalid@email.com' };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toEqual("Error during login!");

      expect(typeof response.body.details).toBe('string');
      expect(response.body.details).toEqual("Authentication failed");

      expect(response.body.success).toBe(false);
    })

    it('should return success when accessing the login route with valid credentials', async () => {
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

    it('should return error when accessing the login route with invalid password', async () => {
      const payload: logintypes = { password: '1234467', email: testUser.email };
      const response = await request(App).post('/api/v1/sessions/login').send(payload);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    })
  });

  describe('POST /addUser', () => {
    let token: string = ''

    const testUser: createUserTypes = {
      email: 'test2@example.com',
      password: 'Abc@1234',
      firstName: 'TesteUser',
      lastName: 'LastName',
      role: 'FREEBIE'
    }

    const targetUser: createUserTypes = {
      email: 'test@adduser.com',
      password: 'Abc@1234',
      firstName: 'AddUser',
      lastName: 'LastName',
      role: 'FREEBIE'
    }

    beforeAll(async () => {
      const [findTestUser, findTargetuser] = await Promise.all([userDb.findFirst({ where: { email: testUser.email } }), userDb.findFirst({ where: { email: targetUser.email } })]);

      if (!findTestUser) await userDb.create({ data: { ...testUser, password: await handleUserPass.generateHash({ password: testUser.password }) } });
      if (findTargetuser) await userDb.deleteMany({ where: { email: targetUser.email } });

      const response = await request(App).post('/api/v1/sessions/login').send({ email: testUser.email, password: testUser.password });
      if (response.statusCode === HTTP_STATUS.OK && response.body.success) token = response.body.data.token;
    });

    afterAll(async () => {
      const [findTestUser, findTargetuser] = await Promise.all([
        userDb.findFirst({ where: { email: testUser.email } }),
        userDb.findFirst({ where: { email: targetUser.email } })
      ]);

      if (!findTestUser) await userDb.deleteMany({ where: { email: testUser.email } });
      if (findTargetuser) await userDb.deleteMany({ where: { email: targetUser.email } });
    });

    it('should return unauthorized if the token is invalid or not send', async () => {
      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.message).toEqual('Unauthorized access!');
      expect(response.body.success).toEqual(false);
    })

    it('should return error when the token is valid but the user does not have permission to add a new user', async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'FREEBIE' } });
      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser).set('Authorization', `Bearer ${token}`);

      console.log("Token: ", token);

      expect(response.statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.message).toEqual('Unauthorized access!');
      expect(response.body.success).toEqual(false);
    })

    it('should return a new user if the token is valid and the role is Admin or Master', async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'ADMIN' } });

      const login = await request(App).post('/api/v1/sessions/login').send({ email: testUser.email, password: testUser.password });
      if (login.statusCode === HTTP_STATUS.OK && login.body.success) token = login.body.data.token;

      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser).set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(HTTP_STATUS.CREATED);
      expect(response.body.message).toEqual('New user created!');
      expect(response.body.success).toEqual(true);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');

      expect(response.body.data.email).toEqual(targetUser.email);
    })

    it('should return when try to create a new user with a email that already exists', async () => {
      await userDb.update({ where: { email: testUser.email }, data: { role: 'ADMIN' } });

      const login = await request(App).post('/api/v1/sessions/login').send({ email: testUser.email, password: testUser.password });
      if (login.statusCode === HTTP_STATUS.OK && login.body.success) token = login.body.data.token;

      await request(App).post('/api/v1/sessions/addUser').send(targetUser).set('Authorization', `Bearer ${token}`);
      const response = await request(App).post('/api/v1/sessions/addUser').send(targetUser).set('Authorization', `Bearer ${token}`);

      expect(response.body.success).toEqual(false);
      expect(response.statusCode).toEqual(HTTP_STATUS.CONFLICT);
      expect(response.body.message).toEqual('Error creating user!');
      expect(response.body.details).toEqual('Duplicate record. Value already exists.');
    })
  })
})