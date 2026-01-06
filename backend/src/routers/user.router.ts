import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { EnsureAuthMiddleware } from '../middlewares/ensureAuth.middleware'

const router = Router();

router.post('/', userController.create);

router.use(EnsureAuthMiddleware.ensureAuth());

router.get('/', EnsureAuthMiddleware.ensureRole(), userController.list);
router.get('/:id', EnsureAuthMiddleware.ensureRole(['FREEBIE', 'SUBSCRIBER', 'ADMIN', 'MASTER']), userController.find);
router.patch('/:id', EnsureAuthMiddleware.ensureRole(['FREEBIE', 'SUBSCRIBER', 'ADMIN', 'MASTER']), userController.update);
router.delete('/:id', EnsureAuthMiddleware.ensureRole(), userController.delete);

export default router;