import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { EnsureAuthMiddleware } from '../middlewares/ensureAuth.middleware'

const router = Router();

router.post('/', UserController.create);

router.use(EnsureAuthMiddleware.ensureAuth());

router.get('/', EnsureAuthMiddleware.ensureRole(), UserController.list);
router.get('/:id', EnsureAuthMiddleware.ensureRole(['FREEBIE', 'SUBSCRIBER', 'ADMIN', 'MASTER']), UserController.find);
router.patch('/:id', EnsureAuthMiddleware.ensureRole(['FREEBIE', 'SUBSCRIBER', 'ADMIN', 'MASTER']), UserController.update);
router.delete('/:id', EnsureAuthMiddleware.ensureRole(), UserController.delete);

export default router;