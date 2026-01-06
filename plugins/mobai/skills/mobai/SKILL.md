---
name: mobai
description: Control Android and iOS mobile devices through the MobAI HTTP API. Use this skill when the user asks to interact with mobile devices, take screenshots, tap elements, type text, swipe, launch apps, or automate mobile tasks.
allowed-tools: mcp__mobai-http__http_request
---

## MobAI Usage Rules (IMPORTANT)

When automating mobile devices, ALWAYS use this order:

1. **mobai:native-runner** - For ANY native app UI automation (tapping, typing, swiping, observing UI)
2. **mobai:web-runner** - For ANY web browser or WebView automation
3. **mobai:agent** - For complex multi-step tasks requiring AI reasoning
4. **Raw HTTP API** - ONLY for: listing devices, starting/stopping bridge

**ALWAYS try DSL subagents first.** Raw HTTP API for tap/type/swipe/screenshot/ui-tree is a LAST RESORT.

**Screenshots:** When using the API, screenshots are automatically saved to `/tmp/mobai/screenshots/` and the path is returned. Use the Read tool to view them.

# MobAI Device Control

This skill enables you to control Android and iOS devices through the MobAI HTTP API running locally.

## Sub-Agent Architecture

For complex automation tasks, use a **hierarchical approach** with specialized sub-agents:

### When to Use Sub-Agents

| Scenario | Approach |
|----------|----------|
| Simple query (list devices, take screenshot) | Direct API call |
| Native app automation (Settings, Instagram) | Spawn **native-runner** sub-agent |
| Web automation (Safari, WebViews) | Spawn **web-runner** sub-agent |
| Complex multi-step task | Break into subgoals, spawn appropriate sub-agent for each |

### Native Runner (`/native-runner`)

Use for **native mobile apps** - apps that use platform UI components:
- Settings app, Mail, Photos, Calendar
- Third-party apps (Instagram, WhatsApp, Uber)
- Any app where you need to tap UI elements by accessibility predicates

**Uses DSL batch execution** with element predicates for robust automation.

**How to spawn:**
```
Use the native-runner skill to accomplish: [subgoal description]
Device ID: [deviceId]
```

### Web Runner (`/web-runner`)

Use for **browsers and WebViews** - web content on any platform:
- **iOS**: Safari tabs, WebViews in apps
- **Android**: Chrome tabs, WebViews in apps
- Any web page where you need CSS selectors

**Uses DSL batch execution** with CSS selectors and JavaScript.

**How to spawn:**
```
Use the web-runner skill to accomplish: [subgoal description]
Device ID: [deviceId]
```

### Example: Complex Task Decomposition

User request: "Log into Twitter, search for 'AI news', and screenshot the results"

**Step 1:** List devices to get device ID (direct API call)
**Step 2:** Launch Twitter app (direct API call)
**Step 3:** Spawn native-runner: "Tap the search tab and enter 'AI news'"
**Step 4:** Wait for results (determine if it's native or web)
**Step 5:** If web results: spawn web-runner: "Scroll to see results"
**Step 6:** Take screenshot (direct API call)

## How to Make API Calls

Use the `mcp__mobai-http__http_request` tool to make HTTP requests:

```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices"
}
```

For POST/PUT/PATCH requests with a body:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{id}/dsl/execute",
  "body": "{\"version\":\"0.2\",\"steps\":[{\"action\":\"observe\",\"context\":\"native\"}]}"
}
```

**Parameters:**
- `method`: HTTP method (GET, POST, PUT, PATCH, DELETE)
- `url`: Full URL to request
- `body`: Request body as JSON string (for POST/PUT/PATCH)
- `headers`: Optional additional headers
- `timeout`: Request timeout in milliseconds (default: 600000 = 10 minutes)

## API Base URL

```
http://127.0.0.1:8686/api/v1
```

No authentication is required. The API runs on localhost only.

## Response Format

**Success responses:**
```json
{"success": true, "data": {...}}
```

**Error responses:**
```json
{"error": "error message", "code": "optional_code", "details": "optional_details"}
```

## Quick Reference - Common Operations

### Device Management (Direct API)

```
GET /devices                    # List all connected devices
GET /devices/{id}               # Get specific device info
GET /devices/{id}/screenshot    # Capture screenshot (base64 PNG)
GET /devices/{id}/apps          # List installed apps (or use DSL observe with include: ["installed_apps"])
```

### Bridge Control (Direct API)

```
POST /devices/{id}/bridge/start # Start on-device bridge (60s timeout)
POST /devices/{id}/bridge/stop  # Stop on-device bridge
```

### DSL Batch Execution (Preferred for Automation)

```
POST /devices/{id}/dsl/execute  # Execute DSL script with retries
```

Example DSL script:
```json
{
  "version": "0.2",
  "steps": [
    {"action": "observe", "context": "native", "include": ["ui_tree"]},
    {"action": "tap", "predicate": {"text_contains": "Settings"}},
    {"action": "observe", "context": "native", "include": ["ui_tree"]}
  ],
  "on_fail": {"strategy": "retry", "max_retries": 2}
}
```

### Scrollable List Operations (Direct API)

```
POST /devices/{id}/scroll-until-visible  # Scroll to find element
POST /devices/{id}/collect-list          # Collect all list items
```

### AI Agent (Direct API)

```
POST /devices/{id}/agent/run    # {"task": "...", "agentType": "toolagent"}
```

## Choosing Between Native and Web Mode

**Use Native Mode (native-runner) when:**
- Working with native app UI (buttons, switches, lists)
- Tapping by element predicate (text, type, label)
- UI tree shows native components (Button, TextField, Switch)

**Use Web Mode (web-runner) when:**
- A browser is open (Safari on iOS, Chrome on Android)
- An app shows a WebView (login forms, embedded content)
- Need CSS selectors for precise element targeting
- Native taps aren't working on web content

**Detection Tips:**
1. Get UI tree first - if it shows web-like elements (WebView), consider web mode
2. If native tap fails on expected element, try web mode
3. Check the current app - Safari/Chrome usually means web mode

## Important Notes

- **Use DSL for automation** - Batch execution is more efficient than individual API calls
- **Direct API for queries** - List devices, screenshots, app lists don't need DSL
- Always ensure the bridge is running (`bridgeRunning: true`) before automation
- Sub-agents use DSL internally - they handle batch execution for you
- See `api-reference.md` for full endpoint documentation
