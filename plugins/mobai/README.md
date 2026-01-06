# MobAI Claude Code Plugin

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[Claude Code](https://claude.ai/code) plugin for [MobAI](https://mobai.run) - AI-powered mobile device automation. This plugin enables Claude Code to control Android and iOS devices, emulators, and simulators through natural language commands.

## Features

- **Device Control**: List, connect, and manage Android/iOS devices
- **Native App Automation**: Tap, type, swipe using accessibility tree
- **Web Automation**: Control Safari/Chrome with CSS selectors
- **DSL Batch Execution**: Execute multiple automation steps efficiently
- **AI Agent**: Run autonomous agents to complete complex tasks

## Prerequisites

- [Claude Code CLI](https://claude.ai/code)
- [MobAI desktop app](https://mobai.run) running locally (provides the HTTP API on port 8686)
- Connected Android or iOS device (or emulator/simulator)

## Installation

### Install from Marketplace

```bash
# Add marketplace first
/plugin marketplace add MobAI-App/mobai-marketplace

# Install the plugin
/plugin install mobai@mobai-marketplace
```

### Install from Local Clone

```bash
git clone https://github.com/MobAI-App/mobai-marketplace.git
/plugin marketplace add ./mobai-marketplace
/plugin install mobai@mobai-marketplace
```

## Available Skills

### mobai
Main skill for device control. Use when interacting with mobile devices, taking screenshots, tapping elements, etc.

### native-runner
Specialized sub-agent for native UI automation. Use for automating native apps like Settings, Mail, Instagram using element predicates and the DSL batch execution system.

### web-runner
Specialized sub-agent for web automation. Use for automating Safari, Chrome, and WebViews using CSS selectors, DOM inspection, and JavaScript execution.

## Available Commands

### /devices
List all connected Android and iOS devices.

### /screenshot [device_id]
Capture a screenshot from a device.

### /agent <device_id> <task>
Run an AI agent to perform a task on the device.

## Example Usage

### List devices
```
/devices
```

### Take screenshot
```
/screenshot ABC123
```

### Run agent task
```
/agent ABC123 Open Settings and enable WiFi
```

### Use native-runner for automation
```
Use the native-runner skill to: Open the Settings app and navigate to Privacy settings
Device ID: ABC123
```

### Use web-runner for web automation
```
Use the web-runner skill to: Navigate to example.com and fill in the login form
Device ID: ABC123
```

## Plugin Structure

```
plugins/mobai/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── .mcp.json                 # MCP server configuration
├── commands/
│   ├── devices.md           # /devices command
│   ├── screenshot.md        # /screenshot command
│   └── agent.md             # /agent command
├── skills/
│   ├── mobai/
│   │   ├── SKILL.md         # Main MobAI skill
│   │   ├── api-reference.md # API documentation
│   │   └── examples.md      # Usage examples
│   ├── native-runner/
│   │   └── SKILL.md         # Native app automation
│   └── web-runner/
│       └── SKILL.md         # Web automation
├── mcp/                     # Bundled MCP server
│   ├── src/index.ts
│   ├── package.json
│   └── dist/
└── README.md
```

## How It Works

The plugin provides:

1. **MCP Server** - HTTP request tool for calling MobAI API
2. **Skills** - Prompt-based guides for automation patterns
3. **Commands** - Quick actions for common operations

All automation goes through the MobAI desktop app's HTTP API running on `http://127.0.0.1:8686`.

## Comparison with MCP Server

| Feature | Claude Code Plugin | MCP Server |
|---------|-------------------|------------|
| Platform | Claude Code only | Any MCP client |
| Tools | http_request (generic) | Named tools + http_request |
| Resources | Skills (markdown) | MCP resources |
| Setup | Plugin install | npx config |

Use this plugin for Claude Code. For other AI tools (Cursor, Windsurf, Cline), use [mobai-mcp](https://github.com/MobAI-App/mobai-mcp).

## Troubleshooting

### "Connection refused" error
- Ensure MobAI desktop app is running
- Check that API is available at http://127.0.0.1:8686

### "Bridge not running" error
- Start the bridge first using the API or the native-runner skill
- iOS bridge may take up to 60 seconds to start

### Screenshots not visible
- Screenshots are saved to `/tmp/mobai/screenshots/`
- Use the Read tool to view them

## Development

```bash
# Clone the marketplace
git clone https://github.com/MobAI-App/mobai-marketplace.git
cd mobai-marketplace/plugins/mobai

# Build MCP server
cd mcp
npm install
npm run build
cd ..

# Install plugin locally
claude plugins add .
```

## License

Apache 2.0 - see [LICENSE](../../LICENSE) for details.
