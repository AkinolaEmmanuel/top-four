export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

let cachedCsrfToken: string | null = null;

export function setCsrfToken(token: string) {
  cachedCsrfToken = token;
}

export function getCsrfToken(): string | null {
  return cachedCsrfToken;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  // Attach CSRF token for mutating requests if we have one
  if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
    const token = getCsrfToken();
    if (token) {
      headers.set('x-csrf-token', token);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensures session cookies are sent
  };

  const response = await fetch(url, config);

  if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.href = '/';
    throw new ApiError(401, 'Authentication Required');
  }

  if (response.status === 403 && retryCount === 0 && options.method && options.method !== 'GET' && options.method !== 'HEAD') {
    try {
      const meResponse = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
      if (meResponse.ok) {
        const data = await meResponse.json();
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
          return apiFetch<T>(endpoint, options, 1);
        }
      }
    } catch (e) { }
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
    return {} as T;
  }

  if (!response.ok) {
    let errorMessage = data?.detail || data?.message || data?.error || 'An error occurred';

    // Append field-specific validation errors if present
    if (data?.errors && Array.isArray(data.errors)) {
      const fieldErrors = data.errors.map((e: any) => e.messages?.join(', ')).filter(Boolean);
      if (fieldErrors.length > 0) {
        errorMessage += ' ' + fieldErrors.join('; ');
      }
    }

    throw new ApiError(
      response.status,
      errorMessage,
      data
    );
  }

  return data as T;
}
