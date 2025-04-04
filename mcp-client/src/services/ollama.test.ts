/**
 * @jest-environment node
 */
import { describe, test, expect, jest } from '@jest/globals';
import { parseAction } from './ollama.js';

// Only test the parseAction function for now
describe('parseAction', () => {
  test('should parse echo action correctly', () => {
    const llmResponse = '[ACTION:echo][MESSAGE:Hello, World!]';
    const result = parseAction(llmResponse);

    expect(result).toEqual({
      action: 'echo',
      params: {
        message: 'Hello, World!'
      }
    });
  });

  test('should parse bmi action correctly', () => {
    const llmResponse = '[ACTION:bmi][WEIGHT:70][HEIGHT:1.75]';
    const result = parseAction(llmResponse);

    expect(result).toEqual({
      action: 'bmi',
      params: {
        weightKg: 70,
        heightM: 1.75
      }
    });
  });

  test('should parse greeting action correctly', () => {
    const llmResponse = '[ACTION:greeting][NAME:John]';
    const result = parseAction(llmResponse);

    expect(result).toEqual({
      action: 'greeting',
      params: {
        name: 'John'
      }
    });
  });

  test('should parse code-review action correctly', () => {
    const llmResponse = '[ACTION:code-review][CODE:function test() { return true; }]';
    const result = parseAction(llmResponse);

    expect(result).toEqual({
      action: 'code-review',
      params: {
        code: 'function test() { return true; }'
      }
    });
  });

  test('should default to unknown action when no action is found', () => {
    const llmResponse = 'This is just a regular text without action';
    const result = parseAction(llmResponse);

    expect(result).toEqual({
      action: 'unknown',
      params: {}
    });
  });

  test('should provide default parameters when they are missing', () => {
    const llmResponse = '[ACTION:echo]';
    const result = parseAction(llmResponse);

    expect(result).toEqual({
      action: 'echo',
      params: {
        message: 'Hello, world!'
      }
    });
  });

  test('should handle exceptions during parsing', () => {
    // Mock implementation to throw an error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockRegexMatch = jest.spyOn(String.prototype, 'match');
    mockRegexMatch.mockImplementation(() => { throw new Error('Regex error'); });

    const result = parseAction('some response');

    expect(result).toEqual({
      action: 'unknown',
      params: {}
    });
    expect(console.error).toHaveBeenCalled();
    
    // Restore the original implementation
    mockRegexMatch.mockRestore();
  });
}); 