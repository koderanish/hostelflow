import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as controller from './application.controller';
import { createSchema, updateSchema, querySchema, actionSchema } from './application.validation';

const router = Router();
router.get('/', validate(querySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.get('/:id/history', controller.getHistory);
router.post('/', validate(createSchema), controller.create);
router.patch('/:id', validate(updateSchema), controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/approve', validate(actionSchema), controller.approve);
router.post('/:id/reject', validate(actionSchema), controller.reject);
router.post('/:id/waitlist', validate(actionSchema), controller.waitlist);
router.post('/:id/cancel', controller.cancel);
router.post('/:id/restore', controller.restore);

export default router;
