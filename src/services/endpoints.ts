/**
 * API Endpoints
 * 
 * Configuration for Solace API services.
 */

// API base URL - can be overridden with SOLACE_API_URL environment variable
const DEFAULT_API_URL = 'http://api.avonlo.com:3000';

export const getApiEndpoint = (): string => {
  const base = process.env.SOLACE_API_URL || DEFAULT_API_URL;
  return `${base}/v1`;
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
