import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readlineSync from 'readline-sync';
import { callOllama, parseAction } from '../services/ollama.js';
import { createOllamaPrompt } from '../prompts/ollama-prompt.js';
import {
  handleEchoAction,
  handleBmiAction,
  handleGreetingAction,
  handleCodeReviewAction,
  handleListResourcesAction,
  handleSqlQueryAction,
  handleCreateTableFromDescriptionAction,
  handleNaturalLanguageQueryAction,
  handleFetchSchemasAction
} from '../services/mcp-client.js';

// Function to ask user for input
export function askQuestion(question: string): string {
  return readlineSync.question(question);
}

// Main function
export async function startInteractiveClient(customClient?: Client): Promise<void> {
  try {
    console.log("Starting Interactive MCP Client...");
    console.log("This client will use Ollama (llama3.2) to interpret your requests");
    console.log("and call the appropriate MCP features.\n");

    let client = customClient;
    
    if (!client) {
      // Create transport to connect to the server process
      const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/server/index.js"]
      });

      // Create client instance with expanded capabilities
      client = new Client(
        { name: "interactive-mcp-client", version: "1.0.0" },
        { 
          capabilities: { 
            prompts: {}, 
            resources: {
              schemas: ["greeting", "sql"]
            }, 
            tools: {
                'echo': {
                    name: 'echo',
                    description: 'Echo back the input message',
                    parameters: {
                        type: 'object',
                        properties: {
                            message: {
                                type: 'string',
                                description: 'The message to echo back'
                            }
                        },
                        required: ['message']
                    }
                },
                'bmi': {
                    name: 'bmi',
                    description: 'Calculate BMI based on height and weight',
                    parameters: {
                        type: 'object',
                        properties: {
                            height: {
                                type: 'number',
                                description: 'Height in meters'
                            },
                            weight: {
                                type: 'number',
                                description: 'Weight in kilograms'
                            }
                        },
                        required: ['height', 'weight']
                    }
                },
                'code-review': {
                    name: 'code-review',
                    description: 'Review code and provide feedback',
                    parameters: {
                        type: 'object',
                        properties: {
                            code: {
                                type: 'string',
                                description: 'The code to review'
                            }
                        },
                        required: ['code']
                    }
                },
                'sql-query': {
                    name: 'sql-query',
                    description: 'Execute a SQL query',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'The SQL query to execute'
                            }
                        },
                        required: ['query']
                    }
                },
                'create-table': {
                    name: 'create-table',
                    description: 'Create a new table from description',
                    parameters: {
                        type: 'object',
                        properties: {
                            tableName: {
                                type: 'string',
                                description: 'Name of the table to create'
                            },
                            columns: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string',
                                            description: 'Column name'
                                        },
                                        type: {
                                            type: 'string',
                                            description: 'Column data type'
                                        }
                                    },
                                    required: ['name', 'type']
                                },
                                description: 'List of columns in the table'
                            }
                        },
                        required: ['tableName', 'columns']
                    }
                },
                'list-tables': {
                    name: 'list-tables',
                    description: 'List all tables in the database',
                    parameters: {
                        type: 'object',
                        properties: {}
                    }
                },
                'natural-query': {
                    name: 'natural-query',
                    description: 'Convert natural language to SQL query',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Natural language query'
                            }
                        },
                        required: ['query']
                    }
                }
            }
          } 
        }
      );

      // Connect to the server
      console.log("Connecting to MCP server...");
      await client.connect(transport);
      console.log("Connected to MCP server");
    }

    // Interactive loop
    let running = true;
    while (running) {
      const query = askQuestion("\nEnter your query (or 'exit' to quit): ");
      
      if (query.toLowerCase() === 'exit') {
        running = false;
        continue;
      }

      // Get prompt and call Ollama
      const prompt = createOllamaPrompt(query);
      const llmResponse = await callOllama(prompt);
      console.log("\nLLM Analysis Result:", llmResponse);
      
      const { action, params } = parseAction(llmResponse);
      
      // Execute the appropriate MCP action
      try {
        switch (action) {
          case "echo":
            await handleEchoAction(client, params.message);
            break;
            
          case "bmi":
            await handleBmiAction(client, params.weightKg, params.heightM);
            break;
            
          case "greeting":
            await handleGreetingAction(client, params.name);
            break;
            
          case "code-review":
            await handleCodeReviewAction(client, params.code);
            break;
            
          case "list":
            await handleListResourcesAction(client);
            break;

          case "sql-query":
            const result = await handleSqlQueryAction(client, params.query);
            console.log("\nQuery Result:", result);
            break;

          case "create-table":
            await handleCreateTableFromDescriptionAction(client, query);
            break;

          case "list-tables":
            const schemas = await handleFetchSchemasAction(client);
            console.log("\nAvailable Schemas:", schemas);
            break;

          case "natural-query":
            const queryResult = await handleNaturalLanguageQueryAction(client, params.query);
            console.log("\nQuery Result:", queryResult);
            break;
            
          default:
            console.log("\nUnknown or unsupported action. Please try again with a clearer request.");
        }
      } catch (error) {
        console.error("Error executing MCP action:", error);
      }
    }

    console.log("\nExiting interactive MCP client. Goodbye!");
    return;
  } catch (error) {
    console.error("Error in interactive MCP client:", error);
    throw error;
  }
}

// Create a separate entry point file
if (import.meta.url.endsWith('interactive-client.js')) {
  startInteractiveClient().catch(console.error);
} 