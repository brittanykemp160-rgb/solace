// Custom error types for better error handling

export class SolaceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SolaceError';
  }
}

export class APIError extends SolaceError {
  constructor(message: string, public status: number) {
    super(message, 'API_ERROR');
    this.name = 'APIError';
  }
}

export class AuthError extends SolaceError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

export class RateLimitError extends SolaceError {
  constructor(public retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export const isAPIError = (e: unknown): e is APIError =>
  e instanceof APIError;
