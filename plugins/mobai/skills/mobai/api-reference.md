# MobAI API Reference

Complete API documentation for MobAI HTTP API.

**Base URL:** `http://127.0.0.1:8686/api/v1`

---

## Health & Documentation

### GET /health
Health check endpoint.

**Response:**
```json
{"status": "ok", "time": "2025-12-27T12:34:56Z"}
```

### GET /openapi.json
Returns OpenAPI 3.0.3 specification.

### GET /docs
Swagger UI for interactive API exploration.

---

## Device Management

### GET /devices
List all connected devices.

**Response:**
```json
[{
  "id": "ABC123DEF456",
  "name": "iPhone 15 Pro",
  "platform": "ios",
  "model": "iPhone15,3",
  "osVersion": "17.0",
  "bridgeRunning": true
}]
```

### GET /devices/{id}
Get specific device info.

**Path Parameters:**
- `id` - Device serial (Android) or UDID (iOS)

**Response:** Single DeviceInfo object (same as above)

**Errors:**
- 404: Device not found

### GET /devices/{id}/screenshot
Capture device screenshot.

**Timeout:** 10 seconds

**Query Parameters:**
- `format` (optional) - Response format. Default: file path
  - omitted: Saves screenshot to file and returns file path
  - `base64`: Returns base64-encoded data (legacy behavior)

**Response (default - file path):**
```json
{
  "path": "/tmp/mobai/screenshots/ABC123DEF456-1704067200.png",
  "format": "png"
}
```

**Response (format=base64):**
```json
{
  "data": "iVBORw0KGgoAAAANSUhEUg...",
  "format": "png"
}
```

The default mode saves the screenshot to `/tmp/mobai/screenshots/` and returns the file path. Use `?format=base64` for legacy base64 data.

### GET /devices/{id}/ui-tree
Get UI accessibility tree.

**Timeout:** 10 seconds

**Query Parameters:**
- `onlyVisible` (optional) - Filter to visible elements only. Default: `true`
  - `true` or omitted: Returns only visible elements with valid bounds
  - `false` or `0`: Returns all elements including invisible ones
- `verbose` (optional) - Include full elements array. Default: `false`
  - `false` or omitted: Returns only the tree string (compact mode)
  - `true`: Returns tree string plus elements array with coordinates

**Examples:**
```
GET /devices/{id}/ui-tree              # compact mode (default)
GET /devices/{id}/ui-tree?verbose=true # include elements array
GET /devices/{id}/ui-tree?onlyVisible=false&verbose=true  # all elements with full data
```

**Response (default - compact):**
```json
{
  "tree": "[0] Button \"Settings\" (10,100 200x50)\n[1] StaticText \"Wi-Fi\" (10,160 200x30)",
  "activity": "com.apple.Preferences"
}
```

**Response (verbose=true):**
```json
{
  "tree": "[0] Button \"Settings\" (10,100 200x50)\n[1] StaticText \"Wi-Fi\" (10,160 200x30)",
  "elements": [
    {"index": 0, "type": "Button", "text": "Settings", "x": 10, "y": 100, "width": 200, "height": 50},
    {"index": 1, "type": "StaticText", "text": "Wi-Fi", "x": 10, "y": 160, "width": 200, "height": 30}
  ],
  "activity": "com.apple.Preferences"
}
```

**Note:** Use `?verbose=true` only when you need element coordinates for coordinate-based taps. The compact mode significantly reduces response size. For iOS devices, invisible elements are those with `visible="false"` attribute or zero dimensions.

---

## UI Operations

### POST /devices/{id}/tap
Tap at coordinates or element index.

**Timeout:** 10 seconds

**Request (by index - preferred):**
```json
{"index": 5}
```

**Request (by coordinates):**
```json
{"x": 100, "y": 200}
```

**Response:**
```json
{"success": true, "data": {"x": 100, "y": 200}}
```

### POST /devices/{id}/swipe
Perform swipe gesture.

**Timeout:** 10 seconds

**Request:**
```json
{
  "fromX": 500,
  "fromY": 1500,
  "toX": 500,
  "toY": 500,
  "duration": 300
}
```

- `duration`: milliseconds (default: 300 if omitted)

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/type
Type text on device.

**Timeout:** 30 seconds

**Request:**
```json
{"text": "Hello World"}
```

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/go-home
Navigate to device home screen.

**Timeout:** 10 seconds

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/open-url
Open URL in device browser.

**Timeout:** 30 seconds

**Request:**
```json
{"url": "https://example.com"}
```

**Response:**
```json
{"success": true}
```

---

## App Management

### GET /devices/{id}/apps
List installed applications.

**Timeout:** 10 seconds

**Response:**
```json
[
  {"bundleId": "com.apple.mobilesafari", "name": "Safari"},
  {"bundleId": "com.apple.Preferences", "name": "Settings"}
]
```

### POST /devices/{id}/launch-app
Launch application by bundle ID.

**Timeout:** 10 seconds

**Request:**
```json
{"bundleId": "com.apple.Preferences"}
```

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/install-app
Install APK (Android) or IPA (iOS) from file path.

**Timeout:** 5 minutes

**Request:**
```json
{"path": "/path/to/app.apk"}
```

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/resign-app
Sign IPA file for iOS device (iOS only).

**Timeout:** 10 minutes

**Request:**
```json
{
  "inputPath": "/path/to/unsigned.ipa",
  "outputPath": "/path/to/signed.ipa",
  "appleId": "developer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bundleId": "com.example.app",
    "outputIpa": "/path/to/signed.ipa",
    "teamId": "ABC123DEF"
  }
}
```

---

## Bridge Control

### POST /devices/{id}/bridge/start
Start on-device bridge (accessibility service on Android, WDA on iOS).

**Timeout:** 60 seconds

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/bridge/stop
Stop on-device bridge.

**Timeout:** 10 seconds

**Response:**
```json
{"success": true}
```

---

## AI Agent

### POST /devices/{id}/agent/run
Run an AI agent task on the device. This is a synchronous endpoint that blocks until the task completes.

**Timeout:** Depends on task complexity (may take minutes)

**Prerequisites:**
- Bridge must be running on the device (`bridgeRunning: true`)
- LLM must be configured in the MobAI app settings

**Request:**
```json
{
  "task": "Open Settings app and enable WiFi",
  "agentType": "toolagent",
  "useVision": false
}
```

- `task`: Required - description of what the agent should do
- `agentType`: Optional - "toolagent" (default), "hierarchical", "classic"
- `useVision`: Optional - enable vision/screenshots (default: from app settings)

**Response (200):**
```json
{
  "success": true,
  "result": "Successfully enabled WiFi in Settings"
}
```

**Response (failure):**
```json
{
  "success": false,
  "result": "Could not find WiFi toggle after scrolling"
}
```

**Errors:**
- 400: Missing task or invalid request body
- 412: Bridge not running - start it first with `/devices/{id}/bridge/start`
- 412: LLM provider not configured in app settings
- 500: Agent execution failed

---

## Web Automation (Browser/WebView Control)

These endpoints provide web automation capabilities for browsers and WebViews on both iOS and Android devices. This allows DOM manipulation using CSS selectors and JavaScript execution.

| Platform | Protocol | Supported Browsers |
|----------|----------|-------------------|
| iOS (Physical devices only) | WebInspector | Safari, WebViews |
| Android | Chrome DevTools Protocol (CDP) | Chrome, WebViews |

**IMPORTANT: iOS Simulators are NOT supported for web automation.** WebInspector protocol only works with physical iOS devices. For iOS simulators, use native UI automation instead.

**Note:** On Android, ensure Chrome has remote debugging enabled or the WebView is debuggable.

### GET /devices/{id}/web/pages
List available web pages (browser tabs and WebViews).

**Timeout:** 10 seconds

**Response (iOS):**
```json
{
  "pages": [
    {
      "appId": "com.apple.mobilesafari",
      "pageId": 1,
      "title": "Example Domain",
      "url": "https://example.com"
    }
  ]
}
```

**Response (Android):**
```json
{
  "pages": [
    {
      "appId": "chrome-target-id",
      "pageId": 0,
      "title": "Example Domain",
      "url": "https://example.com"
    }
  ]
}
```

### POST /devices/{id}/web/select
Select a web page to control.

**Timeout:** 10 seconds

**Request:**
```json
{
  "appId": "com.apple.mobilesafari",
  "pageId": 1
}
```

**Response:**
```json
{"success": true}
```

### GET /devices/{id}/web/dom
Get the DOM tree of the selected web page.

**Timeout:** 30 seconds

**Response:**
```json
{
  "dom": "<html>...",
  "url": "https://example.com",
  "title": "Example Domain"
}
```

The `dom` field contains the full HTML content of the page.

### POST /devices/{id}/web/navigate
Navigate to a URL in the selected web page.

**Timeout:** 30 seconds

**Request:**
```json
{"url": "https://example.com/page"}
```

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/web/click
Click an element using CSS selector.

**Timeout:** 10 seconds

**Request:**
```json
{"selector": "button.submit"}
```

**Examples of selectors:**
- `"button.submit"` - button with class "submit"
- `"#login-btn"` - element with id "login-btn"
- `"input[name='email']"` - input with name attribute
- `"a[href*='login']"` - link containing "login" in href
- `".nav-item:first-child"` - first nav item

**Response:**
```json
{"success": true}
```

### POST /devices/{id}/web/type
Type text into an element using CSS selector.

**Timeout:** 10 seconds

**Request:**
```json
{
  "selector": "input#email",
  "text": "user@example.com"
}
```

**Response:**
```json
{"success": true}
```

**Note:** The selector should target an input, textarea, or contenteditable element.

### POST /devices/{id}/web/execute
Execute JavaScript in the selected web page.

**Timeout:** 30 seconds

**Request:**
```json
{"script": "return document.title"}
```

**Response:**
```json
{
  "result": "Example Domain",
  "type": "string"
}
```

The script is executed in the page context. Use `return` to get a value back. Complex objects are JSON-serialized.

### DELETE /devices/{id}/web
Disconnect from WebInspector.

**Timeout:** 5 seconds

**Response:**
```json
{"success": true}
```

---

## Scrollable List Operations

### POST /devices/{id}/scroll-until-visible
Scroll until an element becomes visible.

**Timeout:** 2 minutes

**Request:**
```json
{
  "targetText": "Settings",
  "maxScrolls": 10,
  "direction": "down"
}
```

- `targetText`: Text to search for
- `maxScrolls`: Maximum scroll attempts (default: 10)
- `direction`: "down" (default) or "up"

**Response:**
```json
{
  "found": true,
  "elementIndex": 15,
  "scrollsPerformed": 3
}
```

### POST /devices/{id}/collect-list
Collect all elements from a scrollable list.

**Timeout:** 5 minutes

**Request:**
```json
{
  "containerIndex": 5,
  "maxScrolls": 20
}
```

- `containerIndex`: Index of the scrollable container element
- `maxScrolls`: Maximum scroll attempts (default: 20)

**Response:**
```json
{
  "items": [
    {"text": "Item 1", "index": 0},
    {"text": "Item 2", "index": 1}
  ],
  "totalCount": 50,
  "scrollsPerformed": 5
}
```

---

## DSL Execution

The DSL (Domain Specific Language) endpoint enables batch execution of multiple automation steps in a single request, with built-in retry handling and structured error responses.

### POST /devices/{id}/dsl/execute
Execute a batch of DSL steps with automatic retry and error handling.

**Timeout:** 5 minutes (configurable per step)

**Request:**
```json
{
  "version": "0.2",
  "mode": "explore",
  "steps": [
    {"action": "observe", "context": "native", "include": ["ui_tree"]},
    {"action": "tap", "predicate": {"text_contains": "Settings"}},
    {"action": "observe", "context": "native", "include": ["ui_tree"]}
  ],
  "on_fail": {
    "strategy": "retry",
    "max_retries": 2,
    "retry_delay_ms": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "step_results": [
    {
      "success": true,
      "step_index": 0,
      "action": "observe",
      "duration_ms": 150,
      "result": {
        "observations": {
          "native": {
            "ui_tree": "[0] Button \"Settings\" (10,100 200x50)\n..."
          }
        }
      }
    },
    {
      "success": true,
      "step_index": 1,
      "action": "tap",
      "duration_ms": 50,
      "result": {
        "matched_element": {"index": 0, "type": "Button", "text": "Settings"}
      }
    }
  ],
  "total_time_ms": 450
}
```

### DSL Actions Reference

| Action | Description | Key Fields |
|--------|-------------|------------|
| `observe` | Get UI tree/screenshot/installed apps | `context`, `include` (ui_tree, screenshot, activity, installed_apps), `include_keyboard` |
| `tap` | Tap element or coordinates | `predicate`, `coords`, `selector` |
| `type` | Type text | `text`, `predicate` (required if keyboard not open), `clear_first`, `dismiss_keyboard` (default: false) |
| `toggle` | Set switch/checkbox to state | `predicate`, `state` ("on"/"off") |
| `swipe` | Swipe gesture | `direction`, `distance`, `duration_ms` |
| `long_press` | Long press | `predicate`, `coords`, `duration_ms` |
| `scroll` | Single scroll or scroll until found `element` | `direction`, `predicate` (container), `to_element` (target), `max_scrolls` |
| `open_app` | Launch app | `bundle_id` |
| `navigate` | Go home/back or URL | `target`, `url` |
| `press_key` | Press key | `key`, `context` (optional: "web" for JS keyboard events - supports enter, tab, delete, escape) |
| `wait_for` | Wait for element | `predicate`, `timeout_ms` |
| `assert_exists` | Verify element exists | `predicate`, `timeout_ms`, `message` |
| `assert_not_exists` | Verify element does NOT exist | `predicate`, `message` |
| `assert_count` | Verify element count | `predicate`, `expected`, `message` |
| `assert_property` | Verify element property | `predicate`, `property`, `expected_value` |
| `assert_screen_changed` | Verify screen content changed | `threshold_percent` |
| `delay` | Wait fixed time | `duration_ms` |
| `execute_js` | Run JavaScript (web) | `script` |
| `select_web_context` | Select web page | `page_id`, `url_contains`, `title_contains` |
| `if_exists` | Conditional execution | `predicate`, `then`, `else` |

**Note on `type` action:** Requires either:
- `predicate` field to target an input element, OR
- Keyboard already open from previous tap on input field

Error if neither condition met: "no predicate specified and keyboard is not open"

### Predicate Matching

Predicates match UI elements by various criteria:

```json
{
  "type": "button",
  "text": "Submit",
  "text_contains": "settings",
  "text_starts_with": "Log",
  "text_regex": "Item \\d+",
  "label": "accessibility_id",
  "label_contains": "btn",
  "enabled": true,
  "visible": true,
  "bounds_hint": "top_half",
  "near": {"text_contains": "Username", "direction": "below"},
  "parent_of": {"text_contains": "Child element"},
  "index": 0
}
```

| Field | Description |
|-------|-------------|
| `type` | Element type: button, input, text, image, cell, switch, slider, link, * |
| `text` | Exact text match (case-sensitive) |
| `text_contains` | Contains substring (case-insensitive) |
| `text_starts_with` | Starts with prefix (case-insensitive) |
| `text_regex` | Regex pattern match |
| `label` | Accessibility label (exact match) |
| `label_contains` | Accessibility label contains |
| `enabled` | Filter by enabled state |
| `visible` | Filter by visibility |
| `bounds_hint` | Screen region: top_half, bottom_half, left_half, right_half, center, top_left, top_right, bottom_left, bottom_right. Selects closest to region center. |
| `near` | Near another element: `{text, text_contains, direction, max_distance}`. Direction uses element edges (not centers). Selects closest match. |
| `parent_of` | Find parent element by child predicate. Traverses up from matched child to first matching ancestor. Example: `{"type": "scrollview", "parent_of": {"text_contains": "Work"}}` |
| `index` | Select Nth match when multiple elements match |

### Failure Strategies

```json
{
  "on_fail": {
    "strategy": "retry",
    "max_retries": 3,
    "retry_delay_ms": 1000,
    "fallback_strategy": {"strategy": "abort"}
  }
}
```

| Strategy | Behavior |
|----------|----------|
| `abort` | Stop execution, return results (default) |
| `skip` | Skip failed step, continue to next |
| `retry` | Retry with delay, then fallback |
| `replan` | Return results for agent to replan |

### Error Codes

| Code | Description |
|------|-------------|
| `NO_MATCH` | No element matched predicate |
| `AMBIGUOUS_MATCH` | Multiple elements matched (use `index`) |
| `TIMEOUT` | Operation timed out |
| `INVALID_ACTION` | Unknown action type |
| `EXECUTION_ERROR` | Runtime error during step |
| `INVALID_PREDICATE` | Malformed predicate |
| `ASSERTION_FAILED` | Assert condition not met |

### Response Metadata

When a DSL script completes, the response includes metadata about the final UI state:

```json
{
  "success": true,
  "step_results": [...],
  "metadata": {
    "screen_title": "Settings",
    "interactive_elements": {
      "buttons": 5,
      "switches": 3,
      "text_fields": 1
    },
    "visible_text": ["General", "Privacy", "About", ...],
    "warnings": [
      "3 buttons have no accessibility labels - use bounds_hint to disambiguate",
      "Keyboard is visible - consider dismissing before final observation"
    ]
  }
}
```

### Toggle Action Results

The `toggle` action returns detailed state information:

```json
{
  "result": {
    "toggled": true,
    "previous_state": "off",
    "current_state": "on",
    "matched_element": {"type": "Switch", "text": "Wi-Fi", ...}
  }
}
```

- `toggled`: Whether a tap was performed (false if already in desired state)
- `previous_state`: "on" or "off" before the action
- `current_state`: "on" or "off" after the action

### Assertion Action Results

Assertion actions return matched element info on success:

```json
{
  "result": {
    "matched_element": {"type": "Button", "text": "Submit", ...},
    "match_count": 3,
    "property_value": true
  }
}
```

- `matched_element`: Element that matched (for `assert_exists`, `assert_property`)
- `matched_elements`: All matching elements (for `assert_count`)
- `match_count`: Number of matches (for `assert_count`)
- `property_value`: Actual property value (for `assert_property`)
- `screen_change_percent`: Percentage of new elements (for `assert_screen_changed`)

### assert_screen_changed

Verifies that the UI has meaningfully changed compared to the last observed state.
Use after navigation actions to confirm the screen changed without predicting destination content.

**Request:**
```json
{"action": "assert_screen_changed", "threshold_percent": 10}
```

**Parameters:**
- `threshold_percent` (optional, default: 15): Minimum percentage of new elements required
**Response (success):**
```json
{
  "success": true,
  "result": {
    "screen_change_percent": 73.5
  }
}
```

**Response (failure):**
```json
{
  "success": false,
  "error": {
    "code": "ASSERTION_FAILED",
    "message": "screen changed 12.5% (threshold: 73.5%)"
  }
}
```

**Use case:** After tapping "Next" button in a wizard flow where each screen has a "Next" button,
use `assert_screen_changed` instead of `assert_not_exists` which would fail.

### Assert Property Values

Available properties for `assert_property`:

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | bool | Element is interactive (clickable or editable) |
| `visible` | bool | Element is visible on screen |
| `selected` | bool | Element is selected |
| `focused` | bool | Element has input focus |
| `editable` | bool | Element accepts text input |
| `scrollable` | bool | Element is scrollable |
| `value` | string | Element's value attribute |
| `text` | string | Element's text content |

### Observe Action Include Values

The `observe` action's `include` field accepts an array of data types to retrieve:

| Include Value | Description | Response Field |
|---------------|-------------|----------------|
| `ui_tree` | Accessibility tree with element hierarchy | `observations.native.ui_tree` |
| `screenshot` | Base64-encoded PNG screenshot | `observations.native.screenshot` |
| `activity` | Current app activity/screen name | `observations.native.activity` |
| `installed_apps` | List of installed applications | `observations.native.installed_apps` |

**Example - Get installed apps:**
```json
{
  "version": "0.2",
  "steps": [
    {"action": "observe", "context": "native", "include": ["installed_apps"]}
  ]
}
```

**Response:**
```json
{
  "step_results": [{
    "success": true,
    "result": {
      "observations": {
        "native": {
          "installed_apps": [
            {"bundleId": "com.apple.Preferences", "name": "Settings"},
            {"bundleId": "com.apple.mobilesafari", "name": "Safari"},
            {"bundleId": "com.instagram.Instagram", "name": "Instagram"}
          ]
        }
      }
    }
  }]
}
