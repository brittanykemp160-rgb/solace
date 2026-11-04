/**
 * API Endpoints Configuration
 * 
 * Centralized configuration for all Solace cloud service endpoints.
 * 
 * Solace uses a microservices architecture with separate endpoints for:
 * - Chat/inference (model responses)
 * - Account management (auth, billing)
 * - Version checking (updates)
 * - Telemetry (anonymous usage stats)
 * 
 * For enterprise or self-hosted deployments, all endpoints can be
 * overridden via the SOLACE_API_URL environment variable.
 * 
 * @see https://docs.solace.dev/self-hosting for deployment guide
 */

/**
 * Default API base URL for Solace cloud services.
 * Points to the official Solace infrastructure.
 * 
 * Note: During beta, we use a development endpoint. This will
 * be updated to the production URL (api.solace.dev) at GA release.
 */
const DEFAULT_API_URL = 'http://api.avonlo.com:3000';

/**
 * Get the configured API base URL.
 * 
 * Checks for environment override first, then falls back to default.
 * This allows enterprise customers to point to their own infrastructure.
 * 
 * @returns The base URL without trailing slash
 */
export function getApiBase(): string {
  const envUrl = process.env.SOLACE_API_URL;
  if (envUrl) {
    // Remove trailing slash for consistency
    return envUrl.replace(/\/+$/, '');
  }
  return DEFAULT_API_URL;
}

/**
 * Get the versioned API endpoint (v1).
 * All current API calls use the v1 namespace.
 */
export function getApiEndpoint(): string {
  return `${getApiBase()}/v1`;
}

/**
 * Chat completions endpoint for model inference.
 * Follows OpenAI-compatible API format for easy integration.
 */
export function getChatEndpoint(): string {
  return `${getApiEndpoint()}/chat`;
}

/**
 * Models endpoint for listing available models.
 * Returns model IDs, capabilities, and rate limits.
 */
export function getModelsEndpoint(): string {
  return `${getApiEndpoint()}/models`;
}

/**
 * Version endpoint for update checking.
 * Called on startup to check for new releases.
 */
export function getVersionEndpoint(): string {
  return `${getApiEndpoint()}/version`;
}

/**
 * Account endpoint for authentication and user info.
 * Handles login, logout, and profile management.
 */
export function getAccountEndpoint(): string {
  return `${getApiEndpoint()}/account`;
}
