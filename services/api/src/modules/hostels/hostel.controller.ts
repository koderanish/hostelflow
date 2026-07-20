import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';
import * as service from './hostel.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.list(req.query);
  sendPaginated(res, result.data, result.total, Number(req.query.page) || 1, Number(req.query.limit) || 10);
});
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id);
  sendSuccess(res, data);
});
export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  sendSuccess(res, data, 'Created successfully', 201);
});
export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  sendSuccess(res, data, 'Updated successfully');
});
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Deleted successfully');
});
