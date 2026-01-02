import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import {EnsureAuthMiddleware} from '../middlewares/ensureAuth.middleware'

const router = Router();

router.post('/login', SessionController.login);
router.post('/addUser', EnsureAuthMiddleware.ensureRole(['ADMIN', 'MASTER']),  SessionController.addUser);

export default router;