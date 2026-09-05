import { apiFetch, setCsrfToken, generateIdempotencyKey } from './fetcher';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  signInMethods?: string[];
  isOperator?: boolean;
}

export async function signUp(input: {
  email: string;
  displayName: string;
  password: string;
}): Promise<{ user: UserProfile; verificationEmailScheduled: boolean }> {
  return apiFetch<{ user: UserProfile; verificationEmailScheduled: boolean }>('/auth/register', {
    method: 'POST',
    headers: {
      'Idempotency-Key': generateIdempotencyKey(),
    },
    body: JSON.stringify({
      email: input.email,
      displayName: input.displayName,
      password: input.password,
    }),
  });
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<UserProfile> {
  const data = await apiFetch<{ user: UserProfile; csrfToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });
  
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }
  
  return data.user;
}

export async function signOut(): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
  });
  setCsrfToken('');
}

export async function fetchCurrentProfile(): Promise<UserProfile | null> {
  try {
    const data = await apiFetch<{ user: UserProfile; csrfToken: string; isOperator: boolean; signInMethods: string[] }>('/auth/me');
    
    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    return { ...data.user, signInMethods: data.signInMethods, isOperator: data.isOperator };
  } catch (err: any) {
    // Return null when unauthenticated (401)
    if (err.status === 401) {
      return null;
    }
    throw err;
  }
}

export async function changeDisplayName(displayName: string): Promise<UserProfile> {
  const data = await apiFetch<{ user: UserProfile }>('/me/display-name', {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  });
  return data.user;
}

export async function changePassword(password: string): Promise<void> {
  await apiFetch('/me/password/change', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function requestEmailChange(newEmail: string): Promise<void> {
  await apiFetch('/me/email-change/request', {
    method: 'POST',
    body: JSON.stringify({ newEmail }),
  });
}
