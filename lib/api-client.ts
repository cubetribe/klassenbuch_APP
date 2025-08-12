import { Course, Student, BehaviorEvent, Reward, Consequence, User } from '@/types';

class APIError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${this.baseURL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url = `${url}?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.defaultHeaders,
        ...fetchOptions.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new APIError(response.status, error.message || 'Request failed', error);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  auth = {
    login: async (email: string, password: string) => {
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      return response.ok;
    },

    logout: async () => {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    },

    register: async (data: {
      email: string;
      password: string;
      name: string;
      schoolName: string;
    }) => {
      return this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getSession: async () => {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
  };

  // Course endpoints
  courses = {
    list: async (params?: { archived?: boolean }) => {
      return this.request<{ courses: Course[] }>('/api/courses', { params });
    },

    get: async (id: string) => {
      return this.request<Course>(`/api/courses/${id}`);
    },

    create: async (data: Partial<Course>) => {
      return this.request<Course>('/api/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<Course>) => {
      return this.request<Course>(`/api/courses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/api/courses/${id}`, {
        method: 'DELETE',
      });
    },

    getStudents: async (courseId: string) => {
      return this.request<{ students: Student[] }>(`/api/courses/${courseId}/students`);
    },
  };

  // Student endpoints
  students = {
    list: async (params?: {
      courseId?: string;
      active?: boolean;
      search?: string;
    }) => {
      return this.request<{ students: Student[] }>('/api/students', { params });
    },

    get: async (id: string) => {
      return this.request<Student>(`/api/students/${id}`);
    },

    create: async (data: {
      displayName: string;
      internalCode: string;
      courseId: string;
      emoji?: string;
    }) => {
      return this.request<Student>('/api/students', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<Student>) => {
      return this.request<Student>(`/api/students/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/api/students/${id}`, {
        method: 'DELETE',
      });
    },

    bulkCreate: async (students: Array<{
      displayName: string;
      internalCode: string;
      courseId: string;
      emoji?: string;
    }>) => {
      return this.request<{ created: Student[] }>('/api/students/bulk', {
        method: 'POST',
        body: JSON.stringify({ students }),
      });
    },

    import: async (file: File, courseId: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', courseId);

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Import failed' }));
        throw new APIError(response.status, error.message || 'Import failed', error);
      }

      return response.json();
    },

    export: async (courseId: string) => {
      const response = await fetch(`/api/students/export?courseId=${courseId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new APIError(response.status, 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${courseId}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  };

  // Behavior Event endpoints
  events = {
    list: async (params?: {
      studentId?: string;
      courseId?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }) => {
      return this.request<{ events: BehaviorEvent[] }>('/api/events', { params });
    },

    create: async (data: {
      studentId: string;
      courseId: string;
      type: string;
      payload: any;
      notes?: string;
    }) => {
      return this.request<BehaviorEvent>('/api/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    bulkCreate: async (events: Array<{
      studentId: string;
      courseId: string;
      type: string;
      payload: any;
      notes?: string;
    }>) => {
      return this.request<{ created: BehaviorEvent[] }>('/api/events/bulk', {
        method: 'POST',
        body: JSON.stringify({ events }),
      });
    },
  };

  // Reward endpoints
  rewards = {
    list: async (courseId: string, params?: { active?: boolean }) => {
      return this.request<{ rewards: Reward[] }>(`/api/rewards`, {
        params: { courseId, ...params },
      });
    },

    get: async (id: string) => {
      return this.request<Reward>(`/api/rewards/${id}`);
    },

    create: async (data: Partial<Reward>) => {
      return this.request<Reward>('/api/rewards', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<Reward>) => {
      return this.request<Reward>(`/api/rewards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/api/rewards/${id}`, {
        method: 'DELETE',
      });
    },

    redeem: async (data: {
      rewardId: string;
      studentId: string;
      quantity?: number;
    }) => {
      return this.request('/api/rewards/redeem', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    bulkRedeem: async (data: {
      rewardId: string;
      studentIds: string[];
      quantity?: number;
    }) => {
      return this.request('/api/rewards/redeem', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // Consequence endpoints
  consequences = {
    list: async (courseId: string, params?: { active?: boolean }) => {
      return this.request<{ consequences: Consequence[] }>(`/api/consequences`, {
        params: { courseId, ...params },
      });
    },

    get: async (id: string) => {
      return this.request<Consequence>(`/api/consequences/${id}`);
    },

    create: async (data: Partial<Consequence>) => {
      return this.request<Consequence>('/api/consequences', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<Consequence>) => {
      return this.request<Consequence>(`/api/consequences/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/api/consequences/${id}`, {
        method: 'DELETE',
      });
    },

    apply: async (data: {
      consequenceId: string;
      studentId: string;
      notes?: string;
    }) => {
      return this.request('/api/consequences/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    bulkApply: async (data: {
      consequenceId: string;
      studentIds: string[];
      notes?: string;
    }) => {
      return this.request('/api/consequences/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // Reports endpoints
  reports = {
    generate: async (params: {
      courseId?: string;
      studentId?: string;
      startDate: string;
      endDate: string;
      format: 'pdf' | 'csv';
    }) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new APIError(response.status, 'Report generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${Date.now()}.${params.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  };
}

// Create singleton instance
const apiClient = new APIClient();

// Export for use in components
export default apiClient;

// Export class for testing
export { APIClient, APIError };

// Retry utility with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof APIError && error.status < 500) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export function dedupe<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = fn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}