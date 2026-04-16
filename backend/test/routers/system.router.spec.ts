import App from '../../src/app';
import request from 'supertest';

import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";

describe('System router', () => {
  describe('/health', () => {
    it('should return a message when accessing the root path', async () => {
      const response = await request(App).get('/health');

      expect(response.statusCode).toEqual(HTTP_STATUS.OK);
      expect(response.body).toEqual({ message: "I'm fine!" })
    });
  })
});