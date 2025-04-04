import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readlineSync from 'readline-sync';

// Function to ask user for input
function askQuestion(question: string): string {
  return readlineSync.question(question);
}

// Function to display a menu and get user choice
function showMenu(): string {
  console.log("\nAvailable MCP Features:");
  console.log("1. Echo - Echo back a message");
  console.log("2. BMI Calculator - Calculate BMI from weight and height");
  console.log("3. Greeting - Get a personalized greeting");
  console.log("4. Code Review - Get a code review template");
  console.log("5. List Resources - List available resources");
  console.log("0. Exit");
  
  return askQuestion("\nEnter your choice (0-5): ");
}

// Main function
async function main(): Promise<void> {
  try {
    console.log("Starting Simple Interactive MCP Client...");

    // Create transport to connect to the server process
    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/server/index.js"]
    });

    // Create client instance with expanded capabilities
    const client = new Client(
      { name: "simple-interactive-client", version: "1.0.0" },
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

    // Connect to the server
    console.log("Connecting to MCP server...");
    await client.connect(transport);
    console.log("Connected to MCP server");

    // Interactive loop
    let running = true;
    while (running) {
      const choice = showMenu();
      
      switch (choice) {
        case '0':
          running = false;
          break;
          
        case '1': // Echo
          const message = askQuestion("Enter message to echo: ");
          console.log("\nCalling echo tool...");
          try {
            const result = await client.callTool({
              name: "echo",
              arguments: { message }
            });
            console.log("Echo result:", result);
          } catch (error) {
            console.error("Error:", error);
          }
          break;
          
        case '2': // BMI Calculator
          const weightStr = askQuestion("Enter weight in kg: ");
          const heightStr = askQuestion("Enter height in meters: ");
          const weightKg = parseFloat(weightStr);
          const heightM = parseFloat(heightStr);
          
          if (isNaN(weightKg) || isNaN(heightM)) {
            console.log("Invalid input. Please enter numeric values.");
            break;
          }
          
          console.log(`\nCalculating BMI for weight=${weightKg}kg, height=${heightM}m...`);
          try {
            const result = await client.callTool({
              name: "calculate-bmi",
              arguments: { weightKg, heightM }
            });
            console.log("BMI result:", result);
          } catch (error) {
            console.error("Error:", error);
          }
          break;
          
        case '3': // Greeting
          const name = askQuestion("Enter name for greeting: ");
          console.log(`\nFetching greeting for "${name}"...`);
          try {
            const result = await client.readResource({
              uri: `greeting://${name}`
            });
            console.log("Greeting result:", result);
          } catch (error) {
            console.error("Error:", error);
          }
          break;
          
        case '4': // Code Review
          console.log("Enter code to review (press Enter twice when done):");
          let code = "";
          let line = "";
          while (true) {
            line = askQuestion("");
            if (line.trim() === "" && code.endsWith("\n")) break;
            code += line + "\n";
          }
          
          console.log("\nGetting code review template...");
          try {
            const result = await client.getPrompt({
              name: "code-review",
              arguments: { code }
            });
            console.log("Code review template:", result);
          } catch (error) {
            console.error("Error:", error);
          }
          break;
          
        case '5': // List Resources
          console.log("\nListing available resources...");
          try {
            const result = await client.listResources({
              schema: "greeting"
            });
            console.log("Available resources:", result);
          } catch (error) {
            console.error("Error:", error);
          }
          break;
          
        default:
          console.log("Invalid choice. Please try again.");
      }
      
      if (running) {
        askQuestion("\nPress Enter to continue...");
      }
    }

    console.log("\nExiting interactive MCP client. Goodbye!");
    process.exit(0);
  } catch (error) {
    console.error("Error in interactive MCP client:", error);
    process.exit(1);
  }
}

main(); 