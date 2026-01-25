# MobAI Usage Examples

Common patterns for controlling mobile devices through the MobAI API using the `mcp__mobai-http__http_request` tool.

## Example 1: Take Screenshot and Analyze UI

First, list devices to get the device ID:
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices"
}
```

Then get the UI tree to understand what's on screen:
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/ui-tree"
}
```

To include invisible elements (useful for finding hidden UI):
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/ui-tree?onlyVisible=false"
}
```

To include keyboard elements (useful for interacting with on-screen keyboards):
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/ui-tree?includeKeyboard=true"
}
```

Take a screenshot for visual context (saved to file automatically):
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/screenshot"
}
```

Response returns file path:
```json
{
  "path": "/tmp/mobai/screenshots/ABC123-1704067200.png",
  "format": "png"
}
```

Use the Read tool to view the saved screenshot.

## Example 2: Tap an Element by Index

After getting the UI tree, find the element index you want to tap. For example, if the UI tree shows:
```
[0] Button "Settings" (10,100 200x50)
[1] Button "WiFi" (10,160 200x50)
[2] Switch "Off" (300,160 60x30)
```

To tap the WiFi button (index 1):
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/tap",
  "body": "{\"index\": 1}"
}
```

## Example 3: Type Text in an Input Field

First tap the input field to focus it, then type:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/tap",
  "body": "{\"index\": 3}"
}
```

```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/type",
  "body": "{\"text\": \"Hello World\"}"
}
```

## Example 4: Scroll Down a List

Use swipe to scroll. Swipe from bottom to top to scroll down:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/swipe",
  "body": "{\"fromX\": 500, \"fromY\": 1500, \"toX\": 500, \"toY\": 500, \"duration\": 300}"
}
```

## Example 5: Launch an App

First list installed apps to find the bundle ID:
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/apps"
}
```

Then launch by bundle ID:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/launch-app",
  "body": "{\"bundleId\": \"com.apple.Preferences\"}"
}
```

## Example 6: Run AI Agent Task

Have the AI agent perform a task on the device. This is a synchronous call that blocks until complete:

```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/agent/run",
  "body": "{\"task\": \"Open the Settings app and toggle WiFi on\"}"
}
```

Response:
```json
{
  "success": true,
  "result": "Successfully toggled WiFi on in Settings"
}
```

**Note:** The LLM provider must be configured in the MobAI app settings, and the bridge must be running on the device.

## Example 7: Complete Automation Flow

A typical automation flow:

1. **List devices:**
   ```json
   {"method": "GET", "url": "http://127.0.0.1:8686/api/v1/devices"}
   ```

2. **Ensure bridge is running:**
   ```json
   {"method": "POST", "url": "http://127.0.0.1:8686/api/v1/devices/{id}/bridge/start"}
   ```

3. **Go to home screen:**
   ```json
   {"method": "POST", "url": "http://127.0.0.1:8686/api/v1/devices/{id}/go-home"}
   ```

4. **Launch target app:**
   ```json
   {"method": "POST", "url": "http://127.0.0.1:8686/api/v1/devices/{id}/launch-app", "body": "{\"bundleId\": \"com.example.app\"}"}
   ```

5. **Get UI tree:**
   ```json
   {"method": "GET", "url": "http://127.0.0.1:8686/api/v1/devices/{id}/ui-tree"}
   ```

6. **Interact with elements:**
   ```json
   {"method": "POST", "url": "http://127.0.0.1:8686/api/v1/devices/{id}/tap", "body": "{\"index\": 2}"}
   ```

7. **Verify result (screenshot saved to file):**
   ```json
   {"method": "GET", "url": "http://127.0.0.1:8686/api/v1/devices/{id}/screenshot"}
   ```
   Response returns `{"path": "/tmp/mobai/screenshots/..."}` - use Read tool to view.

## Example 8: Web Automation with Sub-Agents

A complete flow showing the sub-agent architecture for web automation (works on both iOS and Android):

### Step 1: Use native-runner to open browser and navigate

Spawn the **native-runner** sub-agent with this task:

**iOS:**
```
Use the native-runner skill to accomplish: Open Safari and go to https://example.com/login
Device ID: {deviceId}
```

**Android:**
```
Use the native-runner skill to accomplish: Open Chrome and go to https://example.com/login
Device ID: {deviceId}
```

The native-runner will:
1. Launch the browser app
2. Tap the URL bar
3. Type the URL and press enter

### Step 2: Use web-runner to fill the login form

Once the page loads, spawn the **web-runner** sub-agent:
```
Use the web-runner skill to accomplish: Fill in the login form with email "user@example.com" and password "secret123", then click Login
Device ID: {deviceId}
```

The web-runner will:
1. Navigate to the URL (if not already there)
2. Get DOM to find form elements
3. Type into email and password fields
4. Click the submit button

### Step 3: Verify with screenshot (direct API call)

```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/screenshot"
}
```

## Example 9: Web Automation - Navigate and Fill Form

Direct API calls for web automation:

Navigate to a URL (auto-selects active Safari page):
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/web/navigate",
  "body": "{\"url\": \"https://example.com/login\"}"
}
```

Get the DOM to understand page structure:
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/web/dom"
}
```

Type into email field:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/web/type",
  "body": "{\"selector\": \"input[name='email']\", \"text\": \"user@example.com\"}"
}
```

Type into password field:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/web/type",
  "body": "{\"selector\": \"input[type='password']\", \"text\": \"secretpassword\"}"
}
```

Click submit button:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/web/click",
  "body": "{\"selector\": \"button[type='submit']\"}"
}
```

## Example 10: Extract Data with JavaScript

Execute JavaScript to extract data from a page:
```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/web/execute",
  "body": "{\"script\": \"return Array.from(document.querySelectorAll('.item')).map(el => el.textContent)\"}"
}
```

Response:
```json
{
  "result": ["Item 1", "Item 2", "Item 3"],
  "type": "array"
}
```

## Tips

- Always get the UI tree before tapping to ensure you have the correct element indices
- Element indices can change after any interaction - refresh the UI tree after each action
- Use screenshots for visual verification but rely on UI tree for automation logic
- The bridge must be running (`bridgeRunning: true`) for UI operations to work
- For iOS devices, the bridge may take longer to start (up to 60 seconds)
- **Screenshots are saved to `/tmp/mobai/screenshots/` by default** - use the Read tool to view them
- **Use `?verbose=true` on `/ui-tree` only when you need element coordinates** for coordinate-based taps - compact mode is faster and reduces response size
- **Use `?includeKeyboard=true` on `/ui-tree` when you need to interact with on-screen keyboard keys or identify if keyboard is open for secure fields (iOS)**

## Web Automation Tips

- **Works on both platforms** - iOS (Safari) and Android (Chrome) use the same API
- **No need to select page** - the API auto-selects the active browser page
- **Use navigate first** - `/web/navigate` opens the URL and prepares for DOM interaction
- **Use specific CSS selectors** - prefer id > name > class to avoid ambiguity
- **Check DOM after navigation** - page structure changes on navigation
- **Combine native + web** - use native-runner for browser chrome (opening browser), web-runner for page content
- **JavaScript fallback** - if CSS selectors fail, use `/web/execute` with custom JavaScript
