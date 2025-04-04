import { describe, test, expect } from '@jest/globals';
import { createOllamaPrompt } from './ollama-prompt.js';

describe('createOllamaPrompt', () => {
  test('should create correct prompt with user query', () => {
    const userQuery = 'What is my BMI if I am 70kg and 1.75m tall?';
    const result = createOllamaPrompt(userQuery);
    
    // Verify the prompt contains the user query
    expect(result).toContain(`User query: "${userQuery}"`);
    
    // Verify the prompt includes all required elements
    expect(result).toContain('You are an assistant');
    expect(result).toContain('Available MCP features:');
    expect(result).toContain('1. Echo Tool');
    expect(result).toContain('2. BMI Calculator');
    expect(result).toContain('3. Greeting Resource');
    expect(result).toContain('4. Code Review Prompt');
    expect(result).toContain('5. List Resources');
    
    // Verify response formats are included
    expect(result).toContain('[ACTION:echo]');
    expect(result).toContain('[ACTION:bmi]');
    expect(result).toContain('[ACTION:greeting]');
    expect(result).toContain('[ACTION:code-review]');
    expect(result).toContain('[ACTION:list]');
  });
  
  test('should escape special characters in user query', () => {
    const userQuery = 'Calculate BMI for "John" who is 80kg and 1.8m';
    const result = createOllamaPrompt(userQuery);
    
    // Verify the prompt contains the properly escaped user query
    expect(result).toContain(`User query: "${userQuery}"`);
  });
  
  test('should handle empty user query', () => {
    const userQuery = '';
    const result = createOllamaPrompt(userQuery);
    
    // Verify the prompt contains an empty user query
    expect(result).toContain('User query: ""');
    
    // Verify the prompt still contains all other elements
    expect(result).toContain('You are an assistant');
    expect(result).toContain('Available MCP features:');
  });
}); 