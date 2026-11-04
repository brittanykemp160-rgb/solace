// API endpoint configuration

const API_URL = process.env.SOLACE_API_URL || 'http://api.avonlo.com:3000';

export function getApiEndpoint(): string {
  return `${API_URL}/v1`;
}

export function getChatEndpoint(): string {
  return `${getApiEndpoint()}/chat`;
}

export function getModelsEndpoint(): string {
  return `${getApiEndpoint()}/models`;
}
