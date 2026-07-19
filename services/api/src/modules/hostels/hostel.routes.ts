import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as controller from './hostel.controller';
import { createSchema, updateSchema, querySchema } from './hostel.validation';

const router = Router();
router.get('/', validate(querySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createSchema), controller.create);
router.patch('/:id', validate(updateSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
