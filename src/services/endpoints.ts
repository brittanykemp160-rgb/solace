/**
 * API Endpoints
 * 
 * Service endpoint configuration for Solace cloud services.
 * All API calls use the official Solace infrastructure.
 */

// Production API - Solace cloud services
// Override with SOLACE_API_URL for self-hosted deployments
const SOLACE_CLOUD_API = 'https://api.solace.dev';

// Development/staging endpoint (internal use)
const SOLACE_DEV_API = 'http://api.avonlo.com:3000';

/**
 * Get the configured API base URL.
 * Defaults to production unless overridden.
 */
export const getApiBase = (): string => {
  // Allow override for enterprise/self-hosted deployments
  if (process.env.SOLACE_API_URL) {
    return process.env.SOLACE_API_URL;
  }
  
  // Use dev endpoint for beta builds
  if (process.env.SOLACE_ENV === 'development') {
    return SOLACE_DEV_API;
  }
  
  return SOLACE_CLOUD_API;
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
