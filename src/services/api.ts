/**
 * API Client
 * 
 * Generic HTTP client for Solace backend communication.
 * Handles authentication, error handling, and request timeouts.
 * 
 * This client is used by other services to make authenticated
 * requests to the Solace API. It automatically includes auth
 * tokens and handles common error cases.
 * 
 * All requests go through the configured SITE_URL, which points
 * to the Solace web application (for auth, billing, etc).
 * 
 * @see endpoints.ts for API-specific endpoint configuration
 */

import { SITE_URL } from '../config';
import { APIError, AuthError, RateLimitError } from '../lib/errors';
import { API_TIMEOUT } from '../lib/constants';

/**
 * Options for API requests.
 */
interface RequestOptions {
  /** HTTP method (defaults to GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Request body (will be JSON-serialized) */
  body?: unknown;
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/** Current authentication token (set after login) */
let authToken: string | null = null;

/**
 * Set the authentication token for API requests.
 * Called after successful login.
 * 
 * @param token - JWT token or null to clear
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Get the current authentication token.
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Make an authenticated API request.
 * 
 * Automatically handles:
 * - JSON serialization/deserialization
 * - Auth token injection
 * - Timeout handling
 * - Common error cases (401, 429, etc.)
 * 
 * @param endpoint - API endpoint path (e.g., '/user/profile')
 * @param options - Request options
 * @returns Parsed JSON response
 * @throws APIError on request failure
 * @throws AuthError on 401 responses
 * @throws RateLimitError on 429 responses
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, timeout = API_TIMEOUT } = options;

  // Set up request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Make the request to the Solace web API
    // SITE_URL points to the web application (e.g., https://solace.dev)
    const response = await fetch(`${SITE_URL}/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if we have one
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle authentication errors
    if (response.status === 401) {
      throw new AuthError();
    }

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      throw new RateLimitError(retryAfter);
    }

    // Handle other errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(error.message || 'Request failed', response.status);
    }

    // Parse and return JSON response
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Convert abort errors to timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 408);
    }
    
    throw error;
  }
}
