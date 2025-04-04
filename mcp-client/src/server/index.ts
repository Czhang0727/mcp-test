import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create a new MCP server
const server = new McpServer({
  name: "simple-mcp-server",
  version: "1.0.0"
});

// Add a simple tool that echoes a message
server.tool(
  "echo",
  { message: z.string() },
  async ({ message }: { message: string }) => ({
    content: [{ type: "text", text: `Echo: ${message}` }]
  })
);

// Add a simple tool that calculates BMI
server.tool(
  "calculate-bmi",
  {
    weightKg: z.number(),
    heightM: z.number()
  },
  async ({ weightKg, heightM }: { weightKg: number; heightM: number }) => ({
    content: [{
      type: "text",
      text: `BMI: ${(weightKg / (heightM * heightM)).toFixed(2)}`
    }]
  })
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { 
    list: async () => {
      return {
        resources: [
          { uri: "greeting://World", name: "Default greeting" },
          { uri: "greeting://Alice", name: "Greeting for Alice" },
          { uri: "greeting://Bob", name: "Greeting for Bob" },
          { uri: "greeting://Developer", name: "Greeting for Developer" }
        ]
      };
    }
  }),
  async (uri: URL, variables: Record<string, any>) => {
    console.log("Resource request received! URI:", uri.toString());
    console.log("Extracted variables:", variables);
    
    // Extract name from variables or use a default
    const name = variables.name || "World";
    
    return {
      contents: [{
        uri: uri.toString(),
        text: `Hello, ${name}!`
      }]
    };
  }
);

// Add a simple prompt
server.prompt(
  "code-review",
  { code: z.string() },
  ({ code }: { code: string }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please review this code and suggest improvements:\n\n${code}`
      }
    }]
  })
);

// Connect the server to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.log("MCP Server is running..."); 