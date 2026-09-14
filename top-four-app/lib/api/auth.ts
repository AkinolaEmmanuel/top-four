import { apiFetch, setCsrfToken, generateIdempotencyKey, ApiError } from './fetcher';
import type { Api } from './types';

/**
 * The account as the app holds it: the server's authenticated user, plus the
 * two facts `/auth/me` returns beside it and this module folds in. Both are
 * optional because only that endpoint carries them — a register or sign-in
 * response has the user alone.
 */
export type UserProfile = Api<'AuthenticatedUserDto'> & {
  signInMethods?: Api<'CurrentAuthenticationResponseDto'>['signInMethods'];
  isOperator?: boolean;
};

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

export async function googleChallenge(): Promise<{ nonce: string; expiresAt: string }> {
  return apiFetch<{ nonce: string; expiresAt: string }>('/auth/google/challenge', {
    method: 'POST',
  });
}

export async function googleLogin(idToken: string): Promise<UserProfile> {
  const data = await apiFetch<{ user: UserProfile; csrfToken: string }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
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
    const data = await apiFetch<Api<'CurrentAuthenticationResponseDto'>>('/auth/me');
    
    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    return { ...data.user, signInMethods: data.signInMethods, isOperator: data.isOperator };
  } catch (error) {
    // Not signed in is an answer, not a failure. Anything else is a real error
    // and must keep propagating — including a non-ApiError, which would
    // otherwise be swallowed by a bare `.status` read.
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function changeDisplayName(displayName: string): Promise<UserProfile> {
  const data = await apiFetch<{ user: UserProfile }>('/me/display-name', {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  });
  return data.user;
}

export async function changePassword(input: { currentPassword?: string; newPassword: string }): Promise<void> {
  await apiFetch('/me/password/change', {
    method: 'POST',
    body: JSON.stringify({ currentPassword: input.currentPassword, newPassword: input.newPassword }),
  });
}

export async function requestEmailChange(input: { currentPassword?: string; newEmail: string }): Promise<void> {
  await apiFetch('/me/email-change/request', {
    method: 'POST',
    body: JSON.stringify({ currentPassword: input.currentPassword, newEmail: input.newEmail }),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(input: { token: string; password: string }): Promise<void> {
  await apiFetch('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function verifyEmail(token: string): Promise<void> {
  await apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await apiFetch('/auth/verification-email/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function confirmEmailChange(token: string): Promise<void> {
  await apiFetch('/auth/email-change/confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
