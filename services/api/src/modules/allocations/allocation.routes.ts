import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as controller from './allocation.controller';
import { createSchema, updateSchema, querySchema, transferSchema } from './allocation.validation';

const router = Router();
router.get('/', validate(querySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createSchema), controller.create);
router.patch('/:id', validate(updateSchema), controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/vacate', controller.vacate);
router.post('/:id/transfer', validate(transferSchema), controller.transfer);

export default router;
