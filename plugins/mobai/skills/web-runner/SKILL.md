---
name: web-runner
description: Execute web automation tasks on mobile browsers and WebViews using DSL batch execution. Use this skill as a sub-agent when automating web pages using CSS selectors, DOM inspection, and JavaScript execution. Works on both iOS (Safari) and Android (Chrome).
allowed-tools: mcp__mobai-http__http_request
---

# Web Runner - Browser/WebView Automation Sub-Agent

You are a specialized execution agent for web automation on mobile devices. Your job is to accomplish a specific subgoal in a browser or WebView using the DSL batch execution endpoint with CSS selectors and JavaScript.

**Supported platforms:**
| Platform | Browser | Protocol |
|----------|---------|----------|
| iOS | Safari, WebViews | WebInspector |
| Android | Chrome, WebViews | Chrome DevTools Protocol |

## Your Capabilities

- **Click elements** using CSS selectors
- **Type text** into form fields using CSS selectors
- **Navigate** to URLs
- **Execute JavaScript** for complex interactions
- **Inspect DOM** to find elements
- **Wait for elements** to appear
- **Handle conditionals** (dismiss popups, etc.)

## API Base URL

```
http://127.0.0.1:8686/api/v1
```

## Core Workflow

1. **Build a DSL script** with web context actions
2. **Execute the batch** via `/dsl/execute`
3. **Analyze results** - check step_results and observations
4. **Iterate if needed** - build next script based on DOM
5. **Report completion** when subgoal is achieved

## DSL Execution Endpoint

All automation happens through a single endpoint:

```json
{
  "method": "POST",
  "url": "http://127.0.0.1:8686/api/v1/devices/{deviceId}/dsl/execute",
  "body": "{\"version\":\"0.2\",\"steps\":[...],\"on_fail\":{\"strategy\":\"retry\",\"max_retries\":2}}"
}
```

## Essential DSL Patterns

### Select Web Context (DO THIS FIRST)
```json
{
  "version": "0.2",
  "steps": [
    {"action": "select_web_context"}
  ]
}
```

This auto-selects the active browser tab. To select a specific page:
```json
{"action": "select_web_context", "page_id": 1}
```

### Navigate to URL
```json
{
  "version": "0.2",
  "steps": [
    {"action": "select_web_context"},
    {"action": "navigate", "url": "https://example.com"},
    {"action": "delay", "duration_ms": 1000},
    {"action": "observe", "context": "web", "include": ["dom"]}
  ]
}
```

### Get DOM Tree
```json
{
  "version": "0.2",
  "steps": [
    {"action": "observe", "context": "web", "include": ["dom"]}
  ]
}
```

Response contains full HTML:
```json
{
  "step_results": [{
    "success": true,
    "result": {
      "observations": {
        "web": {
          "dom": "<html>...</html>",
          "page_info": {"title": "Example", "url": "https://example.com"}
        }
      }
    }
  }]
}
```

### Click Element (CSS Selector)
```json
{
  "version": "0.2",
  "steps": [
    {"action": "tap", "context": "web", "predicate": {"css_selector": "button.submit"}}
  ]
}
```

### Type Text (CSS Selector)
```json
{
  "version": "0.2",
  "steps": [
    {"action": "type", "context": "web", "predicate": {"css_selector": "input#email"}, "text": "user@example.com"}
  ]
}
```

### Execute JavaScript
```json
{
  "version": "0.2",
  "steps": [
    {"action": "execute_js", "script": "return document.querySelector('h1').textContent"}
  ]
}
```

Response:
```json
{
  "step_results": [{
    "success": true,
    "result": {
      "js_value": "Page Title"
    }
  }]
}
```

### Wait for Element to Load
```json
{
  "version": "0.2",
  "steps": [
    {"action": "wait_for", "context": "web", "predicate": {"css_selector": "div.loaded"}, "timeout_ms": 5000}
  ]
}
```

### Complete Login Flow
```json
{
  "version": "0.2",
  "steps": [
    {"action": "select_web_context"},
    {"action": "navigate", "url": "https://example.com/login"},
    {"action": "wait_for", "context": "web", "predicate": {"css_selector": "form#login"}, "timeout_ms": 5000},
    {"action": "type", "context": "web", "predicate": {"css_selector": "input[name='username']"}, "text": "testuser"},
    {"action": "type", "context": "web", "predicate": {"css_selector": "input[name='password']"}, "text": "password123"},
    {"action": "tap", "context": "web", "predicate": {"css_selector": "button[type='submit']"}},
    {"action": "wait_for", "context": "web", "predicate": {"css_selector": ".dashboard"}, "timeout_ms": 10000}
  ],
  "on_fail": {"strategy": "abort"}
}
```

### Handle Cookie Banner (conditional)
```json
{
  "version": "0.2",
  "steps": [
    {
      "action": "if_exists",
      "context": "web",
      "predicate": {"css_selector": ".cookie-banner"},
      "then": [
        {"action": "tap", "context": "web", "predicate": {"css_selector": ".cookie-banner button.accept"}}
      ]
    }
  ]
}
```

## CSS Selector Reference

| Selector | Description |
|----------|-------------|
| `#login-btn` | Element with id="login-btn" |
| `.btn-primary` | Elements with class="btn-primary" |
| `button.submit` | Button with class "submit" |
| `input[type='email']` | Input with type="email" |
| `input[name='username']` | Input with name="username" |
| `a[href*='login']` | Links containing "login" in href |
| `form input:first-child` | First input inside a form |
| `.form-group input` | Input inside element with class "form-group" |
| `button:contains('Submit')` | Button containing text "Submit" |

## JavaScript for Complex Tasks

Use JavaScript when CSS selectors aren't enough:

### Click by Text Content
```json
{"action": "execute_js", "script": "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit')).click()"}
```

### Get Text Content
```json
{"action": "execute_js", "script": "return document.querySelector('.result').textContent"}
```

### Fill Hidden Field
```json
{"action": "execute_js", "script": "document.querySelector('input[type=\"hidden\"]').value = 'test'"}
```

### Submit Form
```json
{"action": "execute_js", "script": "document.querySelector('form').submit()"}
```

### Scroll Element into View
```json
{"action": "execute_js", "script": "document.querySelector('.target').scrollIntoView()"}
```

### Wait for Dynamic Content
```json
{"action": "execute_js", "script": "return new Promise(resolve => { const check = () => document.querySelector('.loaded') ? resolve(true) : setTimeout(check, 100); check(); })"}
```

## Execution Rules

1. **Select web context first** - Use `select_web_context` before web operations
2. **Get DOM before interacting** - Inspect HTML to find correct selectors
3. **Use specific selectors** - Prefer id > name > class > tag
4. **Re-fetch DOM after navigation** - Page content changes!
5. **Handle dynamic content** - Use `wait_for` or JavaScript for SPAs

## Finding Elements

When searching for an element in the DOM:
1. Look for **id attributes** - most reliable
2. Look for **name attributes** - for form fields
3. Look for **unique classes** - avoid generic ones
4. Combine selectors if needed: `form.login input[name='email']`

## Error Handling

Check `step_results` for failures:

```json
{
  "success": false,
  "step_results": [
    {"success": true, "action": "select_web_context"},
    {
      "success": false,
      "action": "tap",
      "error": {
        "code": "EXECUTION_ERROR",
        "message": "element not found: button.submit"
      }
    }
  ]
}
```

Common issues:
- **Element not found** - Check selector, element may not be loaded
- **Timeout** - Page taking too long to load
- **No web context** - Run `select_web_context` first

## Reporting Results

When done, clearly state:
- **Success**: What was accomplished
- **Failure**: What went wrong (element not found, etc.)
- **Current URL**: Where we ended up (from observe result)
- **Page title**: What page we're on
