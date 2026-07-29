---
description: List connected Android and iOS devices
---

# List Devices

Fetch the list of connected mobile devices using the `list_devices` tool from the mobai MCP server.

Present the results in a formatted table showing:
- Device ID
- Name
- Platform (Android/iOS)
- Model
- OS Version
- Connection status
- Bridge running status
- In use / claimed by (when `inUse` is true, show the `inUseBy` holder)

Note in the output when a device is remote (`"remote": true` — attached to another MobAI node) or cloud (`"cloud": true` — lives in a cloud device farm). All MobAI tools work on them transparently, but host-local tooling (adb, simctl, ffmpeg) cannot reach them.

## Supported Device Types

MobAI supports both physical devices and virtual devices:

### Physical Devices
- **Android devices** - Connected via USB with USB debugging enabled
- **iOS devices** - Connected via USB

### Emulators and Simulators

Android emulators and iOS simulators appear in the device list once they are running:

**Android Emulator:**
```bash
# Start emulator from command line
emulator -avd <avd_name>
# Or use Android Studio AVD Manager
```

**iOS Simulator (macOS only):**
Shutdown simulators do not appear in `list_devices`. Use the `list_simulators` tool to discover them (including Shutdown ones), then `boot_simulator` to boot one headlessly — it will show up in the device list shortly after.

If no devices are connected, inform the user that they need to either:
- Connect a physical device via USB and ensure the MobAI desktop app is running
- Start an Android emulator, or boot an iOS simulator via `list_simulators` + `boot_simulator`
