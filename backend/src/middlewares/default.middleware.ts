import type { Request, Response, NextFunction } from 'express';

class BaseMiddleware {
  setCors() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
      res.header('Access-Control-Allow-Headers', 'Content-Type, x-access-token')

      if (req.method === 'OPTIONS') {
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');
        res.removeHeader('ETag');
        res.sendStatus(204);
      }

      next();
    }
  }

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
    return (req: Request, res: Response, next: NextFunction) => {
      const { hostname, method, path, ip, protocol } = req;
      const { statusCode } = res;

      const awsRequestForwarded = Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'];
      const awsRequestRealip = Array.isArray(req.headers['x-real-ip']) ? req.headers['x-real-ip'][0] : req.headers['x-real-ip'];

      const userIp = awsRequestForwarded || awsRequestRealip || ip;
      const date = new Date().toUTCString();

      console.info(`ACCESS: ${date} - ${method} ${protocol}://${hostname}${path} ${statusCode} - ${userIp}`);

      next();
    }
  }

  handle404() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.status(404).send("Sorry, can't find that");
    }
  }
}
const defaultMiddleware = new BaseMiddleware();
export default defaultMiddleware; 