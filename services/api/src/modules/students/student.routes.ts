import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as controller from './student.controller';
import { createSchema, updateSchema, querySchema } from './student.validation';

const router = Router();
router.get('/', validate(querySchema, 'query'), controller.list);
router.get('/by-user/:userId', controller.getByUserId);
router.get('/:id', controller.getById);
router.post('/', validate(createSchema), controller.create);
router.patch('/:id', validate(updateSchema), controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/reset-password', controller.resetPassword);

export default router;
