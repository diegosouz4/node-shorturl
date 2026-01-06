import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { EnsureAuthMiddleware } from '../middlewares/ensureAuth.middleware'

const router = Router();

router.post('/login', sessionController.login);

router.use(EnsureAuthMiddleware.ensureAuth());

router.post('/addUser', EnsureAuthMiddleware.ensureRole(), sessionController.addUser);

export default router;