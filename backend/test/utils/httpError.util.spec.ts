import { HttpError } from "../../src/utils/httpError.util";
import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";

describe('httpError.util', () => {
  describe('HttpError class', () => {
    it('should throw HttpError when invalid', () => {
      try {
        throw new HttpError('User not found!', HTTP_STATUS.NOT_FOUND);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpError);
        if (err instanceof HttpError) {
          expect(err.message).toBe('User not found!');
          expect(err.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
        }
      }
    });
  });
});