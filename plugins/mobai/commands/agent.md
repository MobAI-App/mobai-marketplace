---
description: Automate a task on a mobile device
---

# Run Automation Task

Perform a task on a mobile device using the mobai MCP server tools.

**Arguments:** $ARGUMENTS should contain: `<deviceId> <task description>`

If only a task is provided without a device ID, first list devices and use the first available device.

## Steps

1. Read the MCP resource `mobai://reference/device-automation` if you have not already in this session — it documents all DSL actions, predicates, and failure strategies.

2. Parse the arguments. If the device ID is missing, call the `list_devices` tool and pick the first available device (prefer one not marked `inUse`).

3. Ensure the automation bridge is running: call `start_bridge` for the device (iOS bridges can take up to 60 seconds to start).

4. Execute the task with the `execute_dsl` tool. Prefer batching multiple steps into a single DSL script over one call per action. A typical loop:
   - Start with an `observe` step (include `ui_tree`) to see the current screen state.
   - Build a script of actions (`open_app`, `tap`, `type`, `swipe`, `scroll`, `wait_for`, assertions) using element predicates — prefer `text_contains` over exact text.
   - Inspect the step results; if a step failed, observe again and adjust the next script.

5. Verify the outcome (an `assert_exists` step or a `get_screenshot` check) and report the result to the user:
   - What was accomplished, step by step
   - If the task could not be completed, explain what went wrong and how far you got

## Notes

- Web page content (Safari/Chrome/WebViews) is automated with `context: "web"` steps and CSS selector predicates; browser chrome (address bar, tabs) is native UI.
- Complex tasks may take several minutes — keep iterating until the task is done or clearly blocked.
