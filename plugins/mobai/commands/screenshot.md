---
description: Capture a screenshot from a mobile device
---

# Take Screenshot

Capture a screenshot from the specified device.

**Arguments:** $ARGUMENTS should contain the device ID. If not provided, first list devices and use the first available device.

## Steps

1. If no device ID provided in "$ARGUMENTS", fetch device list using `mcp__mobai-http__http_request`:
   ```json
   {
     "method": "GET",
     "url": "http://127.0.0.1:8686/api/v1/devices"
   }
   ```
   Use the first device's ID.

2. Capture screenshot:
   ```json
   {
     "method": "GET",
     "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/screenshot"
   }
   ```

3. The response contains `{"data": "base64_png", "format": "png"}`. Display or describe the screenshot content.

4. Optionally, also fetch the UI tree to provide context about what's visible:
   ```json
   {
     "method": "GET",
     "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/ui-tree"
   }
   ```
