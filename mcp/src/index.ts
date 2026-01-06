#!/usr/bin/env node
/**
 * MCP server that provides HTTP fetch tools for making requests.
 * Supports both HTTP and HTTPS, unlike WebFetch which forces HTTPS.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

const server = new Server(
  {
    name: "mobai-http",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Default timeout: 10 minutes (for long-running agent tasks)
const DEFAULT_TIMEOUT_MS = 600000;

// Screenshot directory for saving base64 images
const SCREENSHOT_DIR = "/tmp/mobai/screenshots";

// Ensure screenshot directory exists
function ensureScreenshotDir(): void {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

// Process screenshot response: save base64 to file, return path
function processScreenshotResponse(body: any): any {
  if (body?.data && body?.format === "png" && !body?.path) {
    ensureScreenshotDir();
    const filename = `screenshot-${Date.now()}.png`;
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(body.data, "base64"));
    return { path: filePath, format: "png", screenshot_saved: true };
  }
  return body;
}

// Save a base64 screenshot to file, return the path
function saveBase64Screenshot(base64Data: string, prefix: string = "dsl"): string | null {
  if (!base64Data || base64Data.length <= 200 || base64Data.startsWith("/")) {
    return null; // Already a path or too short
  }
  ensureScreenshotDir();
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const filePath = path.join(SCREENSHOT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
  return filePath;
}

// Process DSL response: find and save embedded screenshots
function processDslResponse(body: any): any {
  if (!body?.step_results) return body;

  for (const step of body.step_results) {
    // Check in result.observations.native (successful observe action)
    const native = step.result?.observations?.native;
    if (native?.screenshot && !native.screenshot_saved) {
      const filePath = saveBase64Screenshot(native.screenshot, "observe");
      if (filePath) {
        native.screenshot = filePath;
        native.screenshot_saved = true;
      }
    }

    // Check in debug (error debug info)
    if (step.debug?.screenshot && !step.debug.screenshot_saved) {
      const filePath = saveBase64Screenshot(step.debug.screenshot, "debug");
      if (filePath) {
        step.debug.screenshot = filePath;
        step.debug.screenshot_saved = true;
      }
    }
  }
  return body;
}

// Process response body, applying appropriate post-processors
function processResponseBody(body: any, url: string): any {
  // Screenshot endpoint
  if (url.includes("/screenshot")) {
    return processScreenshotResponse(body);
  }
  // DSL execution endpoint
  if (url.includes("/dsl/execute")) {
    return processDslResponse(body);
  }
  return body;
}

// Define the http_request tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "http_request",
        description:
          "LOW-LEVEL HTTP API - Prefer mobai:native-runner or mobai:web-runner skills for automation.\n\n" +
          "Make an HTTP request to any URL. Supports HTTP and HTTPS, all methods (GET, POST, PUT, PATCH, DELETE), and JSON bodies. Default timeout is 10 minutes for long-running operations like agent/run.\n\n" +
          "ANTI-PATTERN: Sequential HTTP calls (GET /ui-tree → POST /tap → GET /ui-tree). USE INSTEAD: mobai:native-runner with DSL batch execution.\n\n" +
          "Use raw HTTP API ONLY for: listing devices, starting/stopping bridge, or when DSL skills are insufficient.",
        inputSchema: {
          type: "object" as const,
          properties: {
            method: {
              type: "string",
              description: "HTTP method (GET, POST, PUT, PATCH, DELETE)",
              enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            },
            url: {
              type: "string",
              description:
                "The URL to request (e.g., http://127.0.0.1:8686/api/v1/devices)",
            },
            body: {
              type: "string",
              description:
                "Request body as JSON string (for POST, PUT, PATCH). Example: {\"index\": 5}",
            },
            headers: {
              type: "object",
              description: "Additional headers to send",
              additionalProperties: { type: "string" },
            },
            timeout: {
              type: "number",
              description:
                "Request timeout in milliseconds. Default: 600000 (10 minutes). Use higher values for agent/run endpoint.",
            },
          },
          required: ["method", "url"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "http_request") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = request.params.arguments as {
    method: string;
    url: string;
    body?: string;
    headers?: Record<string, string>;
    timeout?: number;
  };

  if (!args.method || !args.url) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Error: 'method' and 'url' are required parameters",
        },
      ],
      isError: true,
    };
  }

  // Use provided timeout or default (10 minutes)
  const timeoutMs = args.timeout ?? DEFAULT_TIMEOUT_MS;

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const fetchOptions: RequestInit = {
      method: args.method,
      headers: {
        "Content-Type": "application/json",
        ...args.headers,
      },
      signal: controller.signal,
    };

    if (args.body && ["POST", "PUT", "PATCH"].includes(args.method)) {
      fetchOptions.body = args.body;
    }

    try {
      const response = await fetch(args.url, fetchOptions);
      clearTimeout(timeoutId);

      const responseText = await response.text();

      // Try to pretty-print JSON responses, applying post-processors
      let formattedBody = responseText;
      try {
        let json = JSON.parse(responseText);
        // Apply post-processors (save screenshots to files, etc.)
        json = processResponseBody(json, args.url);
        formattedBody = JSON.stringify(json, null, 2);
      } catch {
        // Not JSON, use raw text
      }

      const result = `Status: ${response.status} ${response.statusText}\n\n${formattedBody}`;

      return {
        content: [{ type: "text" as const, text: result }],
        isError: response.status >= 400,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        content: [
          {
            type: "text" as const,
            text: `Request timed out after ${timeoutMs / 1000} seconds`,
          },
        ],
        isError: true,
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text" as const, text: `Request failed: ${message}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
