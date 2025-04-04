import fetch from 'node-fetch';
import { OllamaRequest, OllamaResponse } from '../types/ollama.interface.js';

// Function to call Ollama API
export async function callOllama(prompt: string): Promise<string> {
  try {
    console.log("Asking LLM to analyze your query...");
    
    const requestBody: OllamaRequest = {
      model: "llama3.2",
      prompt: prompt,
      stream: false
    };

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return `Error: Unable to process request - ${response.statusText}`;
    }

    const data = await response.json() as OllamaResponse;
    return data.response;
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    return `Error: Unable to process request - ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Parse LLM response to determine which MCP feature to use
export function parseAction(response: string): { action: string; params: any } {
  try {
    // Extract action
    const actionMatch = response.match(/\[ACTION:([^\]]+)\]/);
    const action = actionMatch ? actionMatch[1].toLowerCase() : 'unknown';

    // Initialize params object
    const params: any = {};

    // Parse parameters based on action type
    switch (action) {
      case 'echo':
        const messageMatch = response.match(/\[MESSAGE:([^\]]+)\]/);
        params.message = messageMatch ? messageMatch[1] : '';
        break;

      case 'bmi':
        const weightMatch = response.match(/\[WEIGHT:([^\]]+)\]/);
        const heightMatch = response.match(/\[HEIGHT:([^\]]+)\]/);
        params.weightKg = weightMatch ? parseFloat(weightMatch[1]) : 0;
        params.heightM = heightMatch ? parseFloat(heightMatch[1]) : 0;
        break;

      case 'greeting':
        const nameMatch = response.match(/\[NAME:([^\]]+)\]/);
        params.name = nameMatch ? nameMatch[1] : '';
        break;

      case 'code-review':
        const codeMatch = response.match(/\[CODE:([^\]]+)\]/);
        params.code = codeMatch ? codeMatch[1] : '';
        break;

      case 'sql-query':
        const queryMatch = response.match(/\[QUERY:([^\]]+)\]/);
        params.query = queryMatch ? queryMatch[1] : '';
        break;

      case 'create-table':
        const tableMatch = response.match(/\[TABLE:([^\]]+)\]/);
        const columnsMatch = response.match(/\[COLUMNS:([^\]]+)\]/);
        params.tableName = tableMatch ? tableMatch[1] : '';
        params.columns = columnsMatch ? columnsMatch[1] : '';
        break;

      case 'insert':
        const targetTableMatch = response.match(/\[TABLE:([^\]]+)\]/);
        const dataMatch = response.match(/\[DATA:([^\]]+)\]/);
        params.tableName = targetTableMatch ? targetTableMatch[1] : '';
        try {
          params.data = dataMatch ? JSON.parse(dataMatch[1]) : {};
        } catch (e) {
          params.data = {};
        }
        break;

      case 'list-tables':
        // No additional parameters needed
        break;

      default:
        // For unknown actions, return empty params
        break;
    }

    return { action, params };
  } catch (error) {
    console.error('Error parsing action:', error);
    return { action: 'unknown', params: {} };
  }
} 