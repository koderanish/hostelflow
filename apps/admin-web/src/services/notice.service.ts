import { BaseService } from './base.service';
import type { Notice } from '../types';
import { INITIAL_NOTICES } from '../data';

class NoticeService extends BaseService<Notice> {
  constructor() {
    super('notices', INITIAL_NOTICES as Notice[]);
  }
}

export const noticeService = new NoticeService();
