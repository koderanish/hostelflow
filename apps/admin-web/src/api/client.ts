import { API_BASE_URL, MOCK_DELAY } from '../constants';
import type { ApiResponse, PaginatedResponse } from '../types';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.message || json.error || 'Request failed' };
    }

    if (json.data && json.pagination) {
      return {
        success: true,
        data: {
          data: json.data,
          total: json.pagination.total,
          page: json.pagination.page,
          limit: json.pagination.limit,
          totalPages: json.pagination.totalPages,
        } as PaginatedResponse<T>,
      };
    }

    return { success: true, data: json.data as T };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

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

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
