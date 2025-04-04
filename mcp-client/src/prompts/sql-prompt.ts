export function createSqlPrompt(userQuery: string, schemas: string[]): string {
  return `You are a SQL expert. Convert the following natural language query into a valid SQL query.
Your response should be in the following format:
[ACTION:sql-query][QUERY:your sql query here]

For table creation, use:
[ACTION:create-table][TABLE:table_name][COLUMNS:column definitions]

For data insertion, use:
[ACTION:insert][TABLE:table_name][DATA:{"column1": "value1", "column2": "value2"}]

For listing tables, use:
[ACTION:list-tables]

Available schemas:
${schemas.map(schema => `- ${schema}`).join('\n')}

User query: ${userQuery}

Remember:
1. Always use proper SQL syntax
2. For SELECT queries, include clear column names
3. Use appropriate data types
4. Include WHERE clauses when filtering is mentioned
5. Use JOIN when relationships are mentioned
6. Return the response in the exact format specified above

Convert this query: ${userQuery}`;
}

export function createSchemaPrompt(userQuery: string): string {
  return `You are a database schema expert. Create a SQL schema based on the following requirements.
Your response should be in the following format:
[ACTION:create-table][TABLE:table_name][COLUMNS:id INTEGER PRIMARY KEY, column1 TYPE1, column2 TYPE2, etc]

Requirements:
1. Always include an id column as INTEGER PRIMARY KEY
2. Use appropriate SQL data types
3. Include necessary constraints (NOT NULL, UNIQUE, etc.)
4. Follow SQL naming conventions
5. Consider relationships between tables if mentioned

User requirements: ${userQuery}`;
} 