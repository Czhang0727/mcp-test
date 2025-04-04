import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createSqlPrompt, createSchemaPrompt } from '../prompts/sql-prompt.js';
import { callOllama, parseAction } from './ollama.js';
import {
  initializeDatabase,
  handleQueryAction,
  handleCreateTableAction,
  handleInsertAction,
  handleListTablesAction
} from './sqlite-client.js';

let isInitialized = false;

async function ensureDatabaseInitialized() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

export async function handleEchoAction(client: Client, message: string): Promise<void> {
  await ensureDatabaseInitialized();
  try {
    await client.callTool({
      name: "echo",
      arguments: { message }
    });
    console.log("Echo response sent");
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function handleBmiAction(client: Client, weightKg: number, heightM: number): Promise<void> {
  await ensureDatabaseInitialized();
  try {
    await client.callTool({
      name: "bmi",
      arguments: { weightKg, heightM }
    });
    console.log("BMI calculation completed");
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function handleGreetingAction(client: Client, name: string): Promise<void> {
  await ensureDatabaseInitialized();
  try {
    const greeting = await client.readResource({
      uri: `greeting://${name}`
    });
    console.log("Greeting:", greeting);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function handleCodeReviewAction(client: Client, code: string): Promise<void> {
  await ensureDatabaseInitialized();
  try {
    const prompt = await client.getPrompt({
      name: "code-review",
      arguments: { code }
    });
    console.log("Code review prompt:", prompt);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function handleListResourcesAction(client: Client): Promise<void> {
  await ensureDatabaseInitialized();
  try {
    const resources = await client.listResources({
      schema: "greeting"
    });
    console.log("Available resources:", resources);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function handleFetchSchemasAction(client: Client): Promise<string[]> {
  await ensureDatabaseInitialized();
  try {
    const tables = await handleListTablesAction(client);
    console.log('Available schemas:', tables);
    return tables;
  } catch (error) {
    console.error('Error fetching schemas:', error);
    throw error;
  }
}

export async function handleSqlQueryAction(client: Client, query: string): Promise<any> {
  await ensureDatabaseInitialized();
  try {
    const result = await handleQueryAction(client, query);
    return result;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error;
  }
}

export async function handleCreateTableFromDescriptionAction(client: Client, description: string): Promise<void> {
  await ensureDatabaseInitialized();
  try {
    // Generate schema using LLM
    const schemaPrompt = createSchemaPrompt(description);
    const llmResponse = await callOllama(schemaPrompt);
    const { action, params } = parseAction(llmResponse);

    if (action === 'create-table' && params.tableName && params.columns) {
      await handleCreateTableAction(client, params.tableName, params.columns);
      console.log(`Table ${params.tableName} created successfully`);
    } else {
      throw new Error('Invalid schema generation response');
    }
  } catch (error) {
    console.error('Error creating table from description:', error);
    throw error;
  }
}

export async function handleNaturalLanguageQueryAction(client: Client, naturalQuery: string): Promise<any> {
  await ensureDatabaseInitialized();
  try {
    // Get available schemas
    const schemas = await handleFetchSchemasAction(client);
    
    // Generate SQL query using LLM
    const sqlPrompt = createSqlPrompt(naturalQuery, schemas);
    const llmResponse = await callOllama(sqlPrompt);
    const { action, params } = parseAction(llmResponse);

    if (action === 'sql-query' && params.query) {
      const result = await handleQueryAction(client, params.query);
      return result;
    } else {
      throw new Error('Invalid query generation response');
    }
  } catch (error) {
    console.error('Error processing natural language query:', error);
    throw error;
  }
} 