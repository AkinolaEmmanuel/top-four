// In-memory CSRF token store.
// Stored strictly in runtime memory (React state / closure) to prevent CSRF attacks.
// Never persist this token in localStorage or cookies.

let currentCsrfToken: string | null = null;

export function getCsrfToken(): string | null {
  return currentCsrfToken;
}

export function setCsrfToken(token: string | null): void {
  currentCsrfToken = token;
}
