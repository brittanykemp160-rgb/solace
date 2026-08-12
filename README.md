<p align="center">
  <img src="https://raw.githubusercontent.com/brittanykemp160-rgb/solace/main/assets/logo.png" width="120" alt="Solace">
</p>

<h1 align="center">Solace CLI</h1>

<p align="center">
  <strong>Free AI coding agent for your terminal.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#usage">Usage</a> •
  <a href="#pricing">Pricing</a>
</p>

---

## Quick Start

```bash
# Clone and run
git clone https://github.com/brittanykemp160-rgb/solace.git
cd solace
npm install
npm start
```

Then type "Solace" in any folder and that's it. Start chatting with AI about your code.

---

## About

Solace is a free, open-source AI coding assistant that runs in your terminal. Get intelligent code suggestions, refactoring help, and project-aware conversations without paying for expensive API subscriptions. Since we do show a small ad on each thinking cycle of the AI we're able to give a more generous amount of free daily tokens.

### Availability

| Platform | Status |
|----------|--------|
| **Terminal CLI** | Available now |
| **Desktop App** | Coming soon |
| **VS Code Extension** | Coming soon |

## Features

### Terminal-First Design
Type `solace` in any project folder and start chatting. Built with Ink for a native terminal experience with streaming responses, syntax highlighting, and full keyboard navigation.

### Context-Aware AI
Solace understands your project structure, installed tools, and development environment. It reads your codebase to give relevant suggestions instead of generic answers.

### Multi-Model Support
We currently support **DeepSeek** and **Qwen** models. Use `/model` to switch between them or set a default in your config.

### Cross-Platform Sync
Your sessions, preferences, and environment settings sync across devices. Start a conversation on your laptop, continue on your desktop.

### Works With Your Stack
Solace detects your toolchain and adapts. Whether you're building React apps, writing Rust, deploying to AWS, working with Docker and Kubernetes, or building Web3 dApps with Foundry and Hardhat, Solace understands your context and gives relevant help.

### Shell Integration
Tab completion for Solace commands in bash, zsh, and fish. The optional shell hook provides context-aware suggestions based on your current directory.

## Usage

```bash
# Start an interactive chat about the current folder
solace

# Chat about a specific project
solace ~/code/my-app

# Quick one-off question (great for pipes)
solace ask "what does this error mean?"

# Pipe input for analysis
git diff | solace ask "review this"
cat logs.txt | solace ask "find the errors"
```

### Commands

| Command | Description |
|---------|-------------|
| `/new` | Start a new session |
| `/clear` | Clear screen and reset |
| `/resume` | Pick a saved session |
| `/retry` | Regenerate last response |
| `/export` | Save session as Markdown |
| `/model` | Switch AI model |
| `/folder` | Change project folder |
| `/usage` | Check token usage |
| `/config` | View settings |
| `/help` | Show all commands |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Ctrl+C` | Stop streaming / Exit |
| `Up/Down` | Message history |
| `Tab` | Complete command |
| `Ctrl+L` | Clear screen |

## Pricing

Solace is free to use.

| Plan | Price | Daily Tokens |
|------|-------|--------------|
| **Free** | $0 | 5M |
| **Plus** | $15/mo | 100M |
| **Unlimited** | $35/mo | Unlimited |

All plans include full access to all AI models, cross-device sync, and shell integrations.

## Configuration

Settings are stored in your config folder:

- **Linux/macOS:** `~/.config/solace/`
- **Windows:** `%APPDATA%\Solace\`

```bash
solace config          # View current settings
solace config --reset  # Reset to defaults
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SOLACE_MODEL` | Default AI model |
| `SOLACE_THEME` | Color theme (dark/light) |

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with frustration at paying $200/month for AI coding tools.
</p>

