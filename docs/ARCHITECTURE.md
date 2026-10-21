# Architecture

## Overview

Solace CLI is built with:

- **TypeScript** - Type-safe code
- **Ink** - React for the terminal
- **Vite** - Fast bundling

## Directory Structure

```
src/
├── cli/           # Terminal UI
│   ├── ui/        # Ink components
│   ├── utils/     # Helpers
│   └── ...
├── data/          # Models, plans
├── lib/           # Shared utilities
└── services/      # API, storage
```

## Data Flow

1. User enters message
2. Message sent to API
3. Response streamed back
4. UI updates in real-time

## State Management

Sessions stored locally in user config folder. No cloud sync yet.

## API

Currently placeholder. Real API coming with backend launch.
