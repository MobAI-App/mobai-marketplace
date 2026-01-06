# MobAI Marketplace

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Official plugin marketplace for [MobAI](https://mobai.run) - AI-powered mobile device automation. This repository contains Claude Code plugins for controlling Android and iOS devices.

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [mobai](plugins/mobai/) | Control Android/iOS devices, emulators, and simulators |

## Installation

### Add Marketplace

```bash
# From GitHub
/plugin marketplace add MobAI-App/mobai-marketplace

# Or from local clone
git clone https://github.com/MobAI-App/mobai-marketplace.git
/plugin marketplace add ./mobai-marketplace
```

### Install Plugin

```bash
/plugin install mobai@mobai-marketplace
```

## Quick Start

### 1. Install Claude Code

Download and install [Claude Code CLI](https://claude.ai/code).

### 2. Install MobAI Desktop App

Download [MobAI](https://mobai.run) and ensure it's running (provides HTTP API on port 8686).

### 3. Add Marketplace and Install Plugin

```bash
/plugin marketplace add MobAI-App/mobai-marketplace
/plugin install mobai@mobai-marketplace
```

### 4. Connect a Device

Connect an Android/iOS device via USB, or start an emulator/simulator.

### 5. Start Automating

```
/devices           # List connected devices
/screenshot ABC123 # Take a screenshot
/agent ABC123 Open Settings and enable WiFi
```

## Repository Structure

```
mobai-marketplace/
├── .claude-plugin/
│   └── marketplace.json    # Marketplace catalog
├── plugins/
│   └── mobai/              # MobAI device control plugin
│       ├── .claude-plugin/
│       ├── commands/
│       ├── skills/
│       └── mcp/
├── LICENSE
└── README.md
```

## For Other AI Tools

This marketplace is for Claude Code. For other AI tools (Cursor, Windsurf, Cline), use the standalone MCP server:

- **MCP Server**: [mobai-mcp](https://github.com/MobAI-App/mobai-mcp)

## Contributing

We welcome contributions! To add a new plugin:

1. Fork this repository
2. Create your plugin in `plugins/your-plugin-name/`
3. Add plugin entry to `.claude-plugin/marketplace.json`
4. Submit a pull request

## License

Apache 2.0 - see [LICENSE](LICENSE) for details.

## Links

- [MobAI Website](https://mobai.run)
- [MobAI MCP Server](https://github.com/MobAI-App/mobai-mcp)
- [Claude Code Documentation](https://claude.ai/code)
