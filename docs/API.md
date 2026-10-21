# API Reference

## Endpoints

### POST /v1/chat

Send a message and receive a streaming response.

```json
{
  "message": "How do I parse JSON?",
  "modelId": "deepseek-v4.1-flash-abliterated",
  "folder": "/path/to/project"
}
```

### GET /v1/models

List available models.

### GET /v1/usage

Get current token usage.

### POST /v1/auth/login

Authenticate and receive token.

## Authentication

Include token in Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limits

- Free: 5M tokens/day
- Plus: 100M tokens/day
- Unlimited: No limit
