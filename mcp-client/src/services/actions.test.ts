import { describe, test, expect } from '@jest/globals';
import { executeAction } from './actions.js';

describe('executeAction', () => {
  test('should execute echo action correctly', async () => {
    const result = await executeAction('echo', { message: 'Hello, World!' });
    expect(result).toBe('Hello, World!');
  });

  test('should return error for echo action with missing message', async () => {
    const result = await executeAction('echo', {});
    expect(result).toBe('Error: Missing message parameter');
  });

  test('should calculate BMI correctly', async () => {
    const result = await executeAction('bmi', { weightKg: 70, heightM: 1.75 });
    expect(result).toBe('Your BMI is 22.86');
  });

  test('should return error for BMI with missing parameters', async () => {
    const result = await executeAction('bmi', { weightKg: 70 });
    expect(result).toBe('Error: Missing weight or height parameters');
  });

  test('should return error for BMI with invalid parameters', async () => {
    const params = { weightKg: 'seventy' as any, heightM: 1.75 };
    const result = await executeAction('bmi', params);
    expect(result).toBe('Error: Invalid weight or height parameters');
  });

  test('should execute greeting action correctly', async () => {
    const result = await executeAction('greeting', { name: 'John' });
    expect(result).toBe('Hello, John!');
  });

  test('should return error for greeting with missing name', async () => {
    const result = await executeAction('greeting', {});
    expect(result).toBe('Error: Missing name parameter');
  });

  test('should execute code-review action correctly', async () => {
    const code = 'function test() { return true; }';
    const result = await executeAction('code-review', { code });
    expect(result).toBe(`Code Review Results:\n${code}\n\nNo issues found.`);
  });

  test('should return error for code-review with missing code', async () => {
    const result = await executeAction('code-review', {});
    expect(result).toBe('Error: Missing code parameter');
  });

  test('should list available actions', async () => {
    const result = await executeAction('list', {});
    expect(result).toContain('Available actions:');
    expect(result).toContain('- echo: Echo a message');
    expect(result).toContain('- bmi: Calculate BMI');
    expect(result).toContain('- greeting: Get a personalized greeting');
    expect(result).toContain('- code-review: Review code');
    expect(result).toContain('- list: Show this list');
  });

  test('should handle unknown action', async () => {
    const result = await executeAction('unknown', {});
    expect(result).toBe('Unknown action: unknown');
  });
}); 