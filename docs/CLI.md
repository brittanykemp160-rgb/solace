# Solace CLI

The terminal interface for Solace.

## Commands

```bash
solace                  # Interactive chat
solace ~/project        # Chat about a specific folder
solace ask "question"   # One-shot question
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/new` | Start new session |
| `/clear` | Clear and reset |
| `/model` | Switch model |
| `/help` | Show help |
| `/exit` | Quit |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send |
| `Ctrl+C` | Cancel/Exit |
| `Up/Down` | History |
| `Tab` | Complete |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SOLACE_MODEL` | Default model |
| `SOLACE_SITE_URL` | API endpoint |
