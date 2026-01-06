---
description: List connected Android and iOS devices
---

# List Devices

Fetch the list of connected mobile devices from MobAI.

Use the `mcp__mobai-http__http_request` tool:
```json
{
  "method": "GET",
  "url": "http://127.0.0.1:8686/api/v1/devices"
}
```

Present the results in a formatted table showing:
- Device ID
- Name
- Platform (Android/iOS)
- Model
- OS Version
- Connection status
- Bridge running status

## Supported Device Types

MobAI supports both physical devices and virtual devices:

### Physical Devices
- **Android devices** - Connected via USB with USB debugging enabled
- **iOS devices** - Connected via USB

### Emulators and Simulators

MobAI also supports Android emulators and iOS simulators. To use them:

1. **Start the emulator/simulator first** - Launch your Android emulator (via Android Studio AVD Manager or command line) or iOS Simulator (via Xcode) before connecting with MobAI
2. **MobAI will detect it automatically** - Once running, the emulator/simulator will appear in the devices list alongside physical devices
3. **All features work the same** - Screenshots, taps, swipes, text input, and app launching work identically on emulators/simulators

**Android Emulator:**
```bash
# Start emulator from command line
emulator -avd <avd_name>
# Or use Android Studio AVD Manager
```

**iOS Simulator:**
```bash
# Start simulator from command line
open -a Simulator
# Or launch from Xcode > Open Developer Tool > Simulator
```

If no devices are connected, inform the user that they need to either:
- Connect a physical device via USB and ensure MobAI is running
- Start an Android emulator or iOS Simulator, then refresh the devices list
