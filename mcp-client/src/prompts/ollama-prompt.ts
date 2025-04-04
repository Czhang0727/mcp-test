// Template for Ollama prompt to analyze user queries
export function createOllamaPrompt(query: string): string {
  return `
You are an assistant that helps users interact with an MCP (Model Context Protocol) server.
Based on the user's query, determine which MCP feature they want to use.

Available MCP features:
1. Echo Tool - Echoes back a message
2. BMI Calculator - Calculates BMI from weight and height
3. Greeting Resource - Provides a personalized greeting
4. Code Review Prompt - Returns a template for code reviews
5. List Resources - Lists available resources

User query: "${query}"

Respond only with one of the following action formats:
- For echo: [ACTION:echo] [MESSAGE:the message to echo]
- For BMI calculator: [ACTION:bmi] [WEIGHT:weight in kg] [HEIGHT:height in meters]
- For greeting resource: [ACTION:greeting] [NAME:name to greet]
- For code review: [ACTION:code-review] [CODE:the code to review]
- For listing resources: [ACTION:list]
`;
} 