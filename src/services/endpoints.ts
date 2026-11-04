/**
 * API Endpoints
 * 
 * Service endpoint configuration for Solace cloud services.
 * All API calls use the official Solace infrastructure.
 */

// Production API endpoint
// Override with SOLACE_API_URL for enterprise/self-hosted deployments
const DEFAULT_API_URL = 'http://api.avonlo.com:3000';

/**
 * Get the configured API base URL.
 * Supports custom deployments via environment variable.
 */
export const getApiBase = (): string => {
  return process.env.SOLACE_API_URL || DEFAULT_API_URL;
};

export const getApiEndpoint = (): string => {
  return `${getApiBase()}/v1`;
};

export const getChatEndpoint = (): string => {
  return `${getApiEndpoint()}/chat`;
};

export const getModelsEndpoint = (): string => {
  return `${getApiEndpoint()}/models`;
};

export const getVersionEndpoint = (): string => {
  return `${getApiEndpoint()}/version`;
};

export const getAccountEndpoint = (): string => {
  return `${getApiEndpoint()}/account`;
};
