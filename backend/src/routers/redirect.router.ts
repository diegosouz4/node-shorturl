import { Router } from 'express';
import { redirectController } from '../controllers/redirect.controller';

const router = Router();

router.get('/:shortCode', redirectController.redirect);

export default router;