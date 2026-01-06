---
description: Run an AI agent task on a mobile device
---

# Run AI Agent Task

Run an AI agent to automate a task on a mobile device.

**Arguments:** $ARGUMENTS should contain: `<deviceId> <task description>`

If only a task is provided without device ID, first list devices and use the first available device.

## Steps

1. Parse arguments. If device ID is missing, get device list using `mcp__mobai-http__http_request`:
   ```json
   {
     "method": "GET",
     "url": "http://127.0.0.1:8686/api/v1/devices"
   }
   ```

2. Ensure bridge is running. If not, start it:
   ```json
   {
     "method": "POST",
     "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/bridge/start"
   }
   ```

3. Run the agent task (this may take a while):
   ```json
   {
     "method": "POST",
     "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/agent/run",
     "body": "{\"task\": \"<task_description>\"}"
   }
   ```

4. Report the result to the user:
   - If `success: true`, show the result message
   - If `success: false`, explain what went wrong

## Notes

- This is a synchronous call that blocks until the task completes
- The LLM provider must be configured in the MobAI app settings
- Complex tasks may take several minutes to complete
