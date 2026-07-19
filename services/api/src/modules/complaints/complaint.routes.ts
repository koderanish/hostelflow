import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as controller from './complaint.controller';
import { createSchema, updateSchema, querySchema, assignSchema, resolveSchema, rejectSchema } from './complaint.validation';

const router = Router();
router.get('/', validate(querySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.get('/:id/history', controller.getHistory);
router.post('/', validate(createSchema), controller.create);
router.patch('/:id', validate(updateSchema), controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/restore', controller.restore);
router.post('/:id/assign', validate(assignSchema), controller.assignStaff);
router.post('/:id/in-progress', controller.markInProgress);
router.post('/:id/resolve', validate(resolveSchema), controller.resolveComplaint);
router.post('/:id/close', controller.closeComplaint);
router.post('/:id/reject', validate(rejectSchema), controller.rejectComplaint);

export default router;
