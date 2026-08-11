# Development Guide

## Setup

```bash
git clone https://github.com/brittanykemp160-rgb/solace.git
cd solace
npm install
npm link
```

## Development

```bash
npm run dev      # Run CLI with hot reload
npm run build    # Build production
npm run test     # Run tests
```

## Project Structure

```
src/
├── cli/           Terminal UI
├── data/          Models, plans
├── hooks/         React hooks
├── lib/           Utilities
├── services/      API, storage
└── tests/         Unit tests
```

## Code Style

- TypeScript strict mode
- Prettier formatting
- ESLint rules
