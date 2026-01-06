import { Router } from 'express';
import { shortUrlController } from '../controllers/shortUrl.controler';
import { EnsureAuthMiddleware } from '../middlewares/ensureAuth.middleware';

const router = Router();

router.use(EnsureAuthMiddleware.ensureAuth());

router.post('/', shortUrlController.create);
router.get('/:shortUrl', shortUrlController.find);
router.delete('/:shortUrl', shortUrlController.delete);

export default router;