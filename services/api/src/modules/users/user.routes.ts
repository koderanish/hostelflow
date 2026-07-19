import { Router } from 'express';
import * as controller from './user.controller';

const router = Router();
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/reset-password', controller.resetPassword);

export default router;
