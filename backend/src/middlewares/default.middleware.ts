import type { Request, Response, NextFunction } from 'express';
import { reqDetailsParams } from '../types/redirect.types';

export type reqUserDetails = Request & reqDetailsParams;
import { logger } from '../utils/logger.util';
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

class BaseMiddleware {
  setHelmet() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
      res.removeHeader('ETag');

      next();
    }
  }

  setMorgan() {
    const log = logger.createLogger('HTTP');
    return (req: reqUserDetails, res: Response, next: NextFunction) => {
      const { hostname, method, path, ip, protocol } = req;

      const awsRequestForwarded = Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'];
      const awsRequestRealip = Array.isArray(req.headers['x-real-ip']) ? req.headers['x-real-ip'][0] : req.headers['x-real-ip'];

      const userIp = awsRequestForwarded || awsRequestRealip || ip;
      const date = new Date().toUTCString();
      const userAgent = req.headers['user-agent'];

      if (userAgent) req.userAgent = userAgent;
      if (userIp) req.userIp = userIp;

      res.on('finish', () => {
        const { statusCode } = res;

        log.info({
          method,
          protocol,
          hostname,
          path,
          statusCode,
          userIp,
          userAgent
        }, `${method} ${path} ${statusCode}`);
      });

      next();
    }
  }

  handle404() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.status(HTTP_STATUS.NOT_FOUND).send("Sorry, can't find that");
    }
  }
}
const defaultMiddleware = new BaseMiddleware();
export default defaultMiddleware; 