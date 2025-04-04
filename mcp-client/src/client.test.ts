import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { processUserInput } from './client.js';
import * as ollamaService from './services/ollama.js';
import * as actionsService from './services/actions.js';

// Use manual mocks instead of jest.mock
const originalCallOllama = ollamaService.callOllama;
const originalParseAction = ollamaService.parseAction;
const originalExecuteAction = actionsService.executeAction;

describe('Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return error message for empty input', async () => {
    const result = await processUserInput('');
    expect(result).toBe('Please provide a valid input');
  });

  test('should process valid input and return result', async () => {
    // Setup mocks
    const mockOllamaResponse = '[ACTION:echo][MESSAGE:Hello, World!]';
    const mockParsedAction = { action: 'echo', params: { message: 'Hello, World!' } };
    const mockExecuteResult = 'Hello, World!';

    jest.spyOn(ollamaService, 'callOllama').mockResolvedValue(mockOllamaResponse);
    jest.spyOn(ollamaService, 'parseAction').mockReturnValue(mockParsedAction);
    jest.spyOn(actionsService, 'executeAction').mockResolvedValue(mockExecuteResult);

    // Execute function
    const result = await processUserInput('Say hello');
    
    // Verify mocks were called with correct parameters
    expect(ollamaService.callOllama).toHaveBeenCalledWith('Say hello');
    expect(ollamaService.parseAction).toHaveBeenCalledWith(mockOllamaResponse);
    expect(actionsService.executeAction).toHaveBeenCalledWith(
      mockParsedAction.action, 
      mockParsedAction.params
    );
    
    // Verify result
    expect(result).toBe(mockExecuteResult);
  });

  test('should handle error from Ollama API', async () => {
    jest.spyOn(ollamaService, 'callOllama').mockResolvedValue('Error: API failure');
    
    const result = await processUserInput('Say hello');
    
    expect(ollamaService.callOllama).toHaveBeenCalledWith('Say hello');
    expect(ollamaService.parseAction).not.toHaveBeenCalled();
    expect(actionsService.executeAction).not.toHaveBeenCalled();
    expect(result).toBe('Error: API failure');
  });

  test('should handle exception during processing', async () => {
    jest.spyOn(ollamaService, 'callOllama').mockRejectedValue(new Error('Network error'));
    
    const result = await processUserInput('Say hello');
    
    expect(result).toBe('Error: Network error');
  });
}); 