# MobAI Claude Code Plugin

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[Claude Code](https://claude.ai/code) plugin for [MobAI](https://mobai.run) - AI-powered mobile device automation. This plugin enables Claude Code to control Android and iOS devices, emulators, and simulators through natural language commands.

The plugin runs the official [mobai-mcp](https://github.com/MobAI-App/mobai-mcp) server (via `npx -y mobai-mcp`), which proxies to the MobAI desktop app's HTTP API.

## Features

- **Device Control**: List, claim, and manage Android/iOS devices — local, remote, and cloud
- **Native App Automation**: Tap, type, swipe, scroll using accessibility-tree predicates
- **Web Automation**: Control Safari/Chrome and WebViews with CSS selectors and JavaScript
- **DSL Batch Execution**: Execute multi-step automation scripts in a single call
- **Screenshots & UI Audit**: Fast screenshots for analysis, full-quality captures, deterministic UI audits
- **App Management**: List, install (with iOS re-signing), and uninstall apps
- **Testing**: Discover and run `.mob` test cases
- **Live Debugging**: Attach lldb to iOS apps — breakpoints, stepping, expression evaluation
- **Simulator Lifecycle**: List, boot (headless, slim, or disposable clone), and shut down iOS simulators

## Prerequisites

- [Claude Code CLI](https://claude.ai/code)
- Node.js 18+ (to run the MCP server via `npx`)
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

## MCP Tools

The bundled `mobai-mcp` server exposes typed tools, including:

| Area | Tools |
|------|-------|
| Devices | `list_devices`, `get_device`, `claim_device`, `release_device` |
| Bridge | `start_bridge`, `stop_bridge` |
| Screenshots | `get_screenshot` (fast, for analysis), `save_screenshot` (full quality) |
| Automation | `execute_dsl` (taps, typing, swipes, scrolling, web context, assertions, audits) |
| Apps | `list_apps`, `install_app`, `uninstall_app`, `debug_app` |
| Testing | `test_get_active`, `test_list_projects`, `test_run` |
| Debugging (iOS) | `debug_attach`, `debug_state`, `debug_breakpoint`, `debug_eval`, `debug_step`, `debug_detach` |
| Simulators (macOS) | `list_simulators`, `boot_simulator`, `shutdown_simulator` |

It also serves MCP resources with reference documentation Claude reads on demand:

- `mobai://reference/device-automation` — DSL actions, predicates, failure strategies
- `mobai://reference/testing` — `.mob` script syntax and testing workflow
- `mobai://reference/debugging` — lldb debugging workflow
- `mobai://claude-code-preview` — previewing a device's control UI in Claude Code

## Available Commands

### /devices
List all connected Android and iOS devices.

### /screenshot [device_id] [save location]
Capture a screenshot from a device.

### /agent [device_id] <task>
Automate a task on the device (e.g. "Open Settings and enable WiFi").

## Example Usage

```
/devices
/screenshot ABC123
/agent ABC123 Open Settings and enable WiFi
```

Or just ask in natural language:

```
Take a screenshot of the iPhone simulator and tell me what's on screen
Run the login.mob test on the Pixel emulator
Set a breakpoint in LoginViewController.swift:42 and tell me why login fails
```

## Configuration

By default the server talks to the MobAI desktop app at `http://127.0.0.1:8686`. Environment variables (set in your shell or Claude Code MCP config) let you point it elsewhere:

| Variable | Purpose |
|----------|---------|
| `MOBAI_URL` | Base address of the MobAI API, no `/api/v1` (defaults to `http://127.0.0.1:8686`) |
| `MOBAI_TOKEN` | Local desktop app API token, for reaching `:8686` from off-loopback on the same network |
| `MOBAI_API_KEY` | Account key (`mobai_...`) for connecting through the MobAI relay (cloud agents) |

## Plugin Structure

```
plugins/mobai/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── .mcp.json                # MCP server configuration (npx -y mobai-mcp)
├── commands/
│   ├── devices.md           # /devices command
│   ├── screenshot.md        # /screenshot command
│   └── agent.md             # /agent command
└── README.md
```

## How It Works

The plugin configures Claude Code to launch the published [mobai-mcp](https://www.npmjs.com/package/mobai-mcp) server over stdio. The server proxies tool calls to the MobAI desktop app's HTTP API at `http://127.0.0.1:8686`, handles device claiming/leasing automatically, and saves screenshots to disk so Claude can read them.

## Troubleshooting

### "Could not reach the MobAI desktop app" error
- Ensure the MobAI desktop app is installed and running ([download](https://mobai.run/download))
- Check that the API is available at http://127.0.0.1:8686

### "Bridge not running" error
- Start the bridge first with the `start_bridge` tool
- iOS bridge may take up to 60 seconds to start

### Device is claimed by someone else
- Devices with `inUse: true` are leased to the holder in `inUseBy` — claim a different device or wait for the lease to expire

### Screenshots not visible
- Screenshots are saved under the OS temp directory (`<tmp>/mobai/screenshots/`)
- Use the Read tool to view them

## License

Apache 2.0 - see [LICENSE](../../LICENSE) for details.
