---
description: Capture a screenshot from a mobile device
---

# Take Screenshot

Capture a screenshot from the specified device using the mobai MCP server tools.

**Arguments:** $ARGUMENTS should contain the device ID, optionally followed by a save location. If no device ID is provided, first list devices and use the first available device.

## Steps

1. If no device ID is provided in "$ARGUMENTS", call the `list_devices` tool and use the first available device's ID.

2. Capture the screenshot:
   - To view/analyze the screen yourself, call `get_screenshot` (fast, low quality, meant for LLM processing). It returns the path to the saved image — use the Read tool to view it.
   - If the user wants a screenshot saved for reporting, debugging, or sharing (or gave a save location), call `save_screenshot` instead (full-quality PNG). Pass `path` (directory, supports `~/`) and `name` (filename without extension) when the user specified them.

3. Report the saved file path to the user. If you viewed the image, briefly describe what is on screen.

## Notes

- `get_screenshot` may downscale the image and return a scale factor — multiply any coordinates read off the image by that factor before using them in device actions.
- If the call fails because the bridge is not running, call `start_bridge` for the device first, then retry.
