import { Router } from 'express';
import { shortUrlController } from '../controllers/shortUrl.controler';

const router = Router();

router.get('/', shortUrlController.list);
router.get('/:id', shortUrlController.find);
router.post('/', shortUrlController.create);
router.patch('/:id', shortUrlController.update);
router.delete('/:id', shortUrlController.delete);

export default router;