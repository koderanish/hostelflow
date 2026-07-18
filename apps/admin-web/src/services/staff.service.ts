import { BaseService } from './base.service';
import type { Staff } from '../types';
import { INITIAL_STAFF } from '../data';

class StaffService extends BaseService<Staff> {
  constructor() {
    super('staff', INITIAL_STAFF as Staff[]);
  }
}

export const staffService = new StaffService();
