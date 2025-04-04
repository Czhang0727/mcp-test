# MCP Server

A sample implementation of the Model Context Protocol (MCP) server and client.

## Features

- Echo Tool - Echo back the input message
- BMI Calculator Tool - Calculate BMI from weight and height
- Code Review Prompt - Generate a code review template
- Dynamic Greeting Resource - Resources with parameterized URIs (e.g., `greeting://World`, `greeting://Alice`)
- Interactive LLM-powered Client - Uses Ollama (llama3.2) to interpret natural language queries
- Simple Interactive Menu-based Client - Direct access to MCP features through a menu interface

## Installation

1. Install dependencies:
```bash
yarn install
```

2. Build the project:
```bash
yarn build
```

## Usage

### Starting the Server

```bash
yarn start
```

### Starting the HTTP Server

```bash
yarn start:http
```

### Running the Client

```bash
yarn client
```

### Running the HTTP Client

```bash
yarn http-client
```

### Running the Interactive Client (Ollama-powered)

Prerequisites:
- Ollama running locally with llama3.2 model installed
- Ollama API accessible at http://localhost:11434

```bash
yarn client:interactive
```

The interactive client reads user queries from the console, calls the Ollama API to interpret the query, extracts intent and parameters, invokes the appropriate MCP feature, and displays the results.

Example interactions:
- "Echo back hello world" → Calls the echo tool with "hello world"
- "Calculate BMI for someone who is 70kg and 1.75m tall" → Calls the BMI calculator
- "Get greeting for Alice" → Fetches the "greeting://Alice" resource
- "Review this code: function add(a, b) { return a + b; }" → Gets a code review template
- "List all available resources" → Lists available resources

### Running the Simple Interactive Client

A menu-driven alternative that doesn't require Ollama:

```bash
yarn client:simple
```

This client presents a menu of available MCP features and guides you through providing the necessary inputs for each feature.

## Dynamic Resource Binding

The server demonstrates dynamic resource binding using the `ResourceTemplate` class. This allows for:

1. Parameterized URI patterns (e.g., `greeting://{name}`)
2. Extraction of parameters from URIs
3. Dynamic generation of resource content based on parameters

Example implementation:

```typescript
// Register a dynamic resource with a URI template pattern
const greetingResource = new ResourceTemplate({
  schema: "greeting",
  uriPattern: "greeting://{name}",
  list: async () => {
    return [
      { uri: "greeting://World", name: "Greeting for World" },
      { uri: "greeting://Alice", name: "Greeting for Alice" },
      { uri: "greeting://Bob", name: "Greeting for Bob" }
    ];
  },
  read: async (uri: string, variables: Record<string, any>) => {
    // Extract name parameter from the URI
    const { name } = variables;
    return { 
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString()
    };
  }
});

// Register the resource with the server
server.registerResource(greetingResource);
```

Examples:
- URI: `greeting://World` → Response: `{ "message": "Hello, World!", "timestamp": "..." }`
- URI: `greeting://Alice` → Response: `{ "message": "Hello, Alice!", "timestamp": "..." }`
- URI: `greeting://Bob` → Response: `{ "message": "Hello, Bob!", "timestamp": "..." }`

## Tools and Resources

The server implements the following capabilities:

### Tools

- **Echo Tool**: Echoes back a message
  - Parameter: `message` (string)
  
- **BMI Calculator**: Calculates BMI from weight and height
  - Parameters: 
    - `weightKg` (number)
    - `heightM` (number)

### Resources

- **Dynamic Greeting Resource**: Returns a personalized greeting
  - URI Template: `greeting://{name}` - Dynamic parameter binding
  - Example URIs:
    - `greeting://World` → "Hello, World!"
    - `greeting://Alice` → "Hello, Alice!"
    - `greeting://Bob` → "Hello, Bob!"

### Prompts

- **Code Review Prompt**: Template for requesting code reviews
  - Parameter: `code` (string)

## Dynamic Resource Binding

This implementation demonstrates how to use `ResourceTemplate` for dynamic resource binding:

```typescript
// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { 
    list: async () => {
      return {
        resources: [
          { uri: "greeting://World", name: "Default greeting" },
          { uri: "greeting://Alice", name: "Greeting for Alice" },
          { uri: "greeting://Bob", name: "Greeting for Bob" }
        ]
      };
    }
  }),
  async (uri: URL, variables: Record<string, any>) => {
    // Extract name from variables
    const name = variables.name || "World";
    
    return {
      contents: [{
        uri: uri.toString(),
        text: `Hello, ${name}!`
      }]
    };
  }
);
```

This approach allows the client to access resources through parameterized URIs, with parameters automatically extracted and passed to your handler.

## Using with MCP Clients

You can connect to this server from any MCP client. Here's a basic example using the TypeScript SDK:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"]
});

const client = new Client(
  { name: "example-client", version: "1.0.0" },
  { 
    capabilities: { 
      prompts: {}, 
      resources: {
        schemas: ["greeting"]
      }, 
      tools: {} 
    }
  }
);

await client.connect(transport);

// Call the echo tool
const result = await client.callTool({
  name: "echo",
  arguments: { message: "Hello, MCP!" }
});

console.log(result);

// Access a parameterized resource
const greeting = await client.readResource({
  uri: "greeting://Alice"
});

console.log(greeting); // { contents: [{ uri: "greeting://Alice", text: "Hello, Alice!" }] }
``` 