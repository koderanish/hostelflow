import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';
import * as service from './complaint.service';

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

export const restore = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.restore(req.params.id);
  sendSuccess(res, data, 'Restored successfully');
});

export const assignStaff = asyncHandler(async (req: Request, res: Response) => {
  const { staffId, staffName } = req.body;
  const data = await service.assignStaff(req.params.id, staffId, staffName);
  sendSuccess(res, data, 'Staff assigned');
});

export const markInProgress = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.markInProgress(req.params.id);
  sendSuccess(res, data, 'Marked in progress');
});

export const resolveComplaint = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.resolveComplaint(req.params.id, req.body.resolutionNotes);
  sendSuccess(res, data, 'Complaint resolved');
});

export const closeComplaint = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.closeComplaint(req.params.id);
  sendSuccess(res, data, 'Complaint closed');
});

export const rejectComplaint = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.rejectComplaint(req.params.id, req.body.remarks);
  sendSuccess(res, data, 'Complaint rejected');
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getHistory(req.params.id);
  sendSuccess(res, data);
});
