import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';
import * as service from './application.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.list(req.query);
  sendPaginated(res, result.data, result.total, Number(req.query.page) || 1, Number(req.query.limit) || 10);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id);
  if (!data) return sendSuccess(res, null, 'Not found', 404);
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

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.approve(req.params.id, req.body.reviewedBy, req.body.reviewRemarks);
  sendSuccess(res, data, 'Application approved');
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.reject(req.params.id, req.body.reviewedBy, req.body.reviewRemarks);
  sendSuccess(res, data, 'Application rejected');
});

export const waitlist = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.waitlist(req.params.id, req.body.reviewedBy, req.body.reviewRemarks);
  sendSuccess(res, data, 'Application waitlisted');
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.cancel(req.params.id);
  sendSuccess(res, data, 'Application cancelled');
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.restore(req.params.id);
  sendSuccess(res, data, 'Restored successfully');
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getHistory(req.params.id);
  sendSuccess(res, data);
});
