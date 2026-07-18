import { MOCK_DELAY } from '../constants';
import type { ApiResponse, PaginatedResponse } from '../types';

export interface MockCallOptions {
  delay?: number;
  shouldFail?: boolean;
  errorMessage?: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export async function mockApiCall<T>(
  data: T,
  options?: MockCallOptions | boolean
): Promise<ApiResponse<T>> {
  if (typeof options === 'boolean') {
    options = { shouldFail: options };
  }
  const { delay: delayMs = MOCK_DELAY, shouldFail = false, errorMessage = 'Server error. Please try again.' } = options || {};
  await delay(delayMs);
  if (shouldFail) {
    return { success: false, error: errorMessage };
  }
  return { success: true, data };
}

export async function mockPaginatedApiCall<T>(
  allData: T[],
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: Record<string, string>,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<ApiResponse<PaginatedResponse<T>>> {
  await delay(MOCK_DELAY);

  let result = [...allData];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(item =>
      Object.values(item as any).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => (item as any)[key] === value);
      }
    });
  }

  if (sortBy) {
    result.sort((a: any, b: any) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortOrder === 'desc' ? -cmp : cmp;
    });
  }

  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return {
    success: true,
    data: { data: paginated, total, page, limit, totalPages },
  };
}
