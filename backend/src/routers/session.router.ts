import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { EnsureAuthMiddleware } from '../middlewares/ensureAuth.middleware'

const router = Router();

router.post('/login', SessionController.login);

router.use(EnsureAuthMiddleware.ensureAuth());

router.post('/addUser', EnsureAuthMiddleware.ensureRole(), SessionController.addUser);

export default router;