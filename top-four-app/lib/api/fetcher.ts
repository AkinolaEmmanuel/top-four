export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
