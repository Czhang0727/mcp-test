/**
 * @jest-environment node
 */
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies
jest.mock('readline-sync', () => ({
  question: jest.fn()
}));

// Create a mock client class
const mockClient = {
  connect: jest.fn().mockResolvedValue(undefined as void),
  callTool: jest.fn().mockResolvedValue(undefined as void),
  readResource: jest.fn().mockResolvedValue(''),
  getPrompt: jest.fn().mockResolvedValue(''),
  listResources: jest.fn().mockResolvedValue([])
};

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn(() => mockClient)
}));

jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: jest.fn()
}));

jest.mock('../services/ollama.js', () => ({
  callOllama: jest.fn(),
  parseAction: jest.fn()
}));

jest.mock('../services/mcp-client.js', () => ({
  handleEchoAction: jest.fn(),
  handleBmiAction: jest.fn(),
  handleGreetingAction: jest.fn(),
  handleCodeReviewAction: jest.fn(),
  handleListResourcesAction: jest.fn()
}));

jest.mock('../prompts/ollama-prompt.js', () => ({
  createOllamaPrompt: jest.fn()
}));

// Import dependencies after mocking
import readlineSync from 'readline-sync';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import * as ollamaService from '../services/ollama.js';
import * as mcpClientService from '../services/mcp-client.js';
import * as promptService from '../prompts/ollama-prompt.js';
import { startInteractiveClient } from './interactive-client.js';

describe('Interactive Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('mocked modules are available', () => {
    // Verify that the mocks for dependencies are set up correctly
    expect(readlineSync.question).toBeDefined();
    expect(Client).toBeDefined();
    expect(ollamaService.callOllama).toBeDefined();
    expect(ollamaService.parseAction).toBeDefined();
    expect(mcpClientService.handleEchoAction).toBeDefined();
    expect(promptService.createOllamaPrompt).toBeDefined();
  });

  test('handles echo action correctly', async () => {
    const userInput = 'echo something';
    const ollamaResponse = '[ACTION:echo][MESSAGE:Hello, World!]';
    const parsedAction = {
      action: 'echo',
      params: { message: 'Hello, World!' }
    };

    (readlineSync.question as jest.Mock).mockReturnValueOnce(userInput).mockReturnValueOnce('exit');
    (promptService.createOllamaPrompt as jest.Mock).mockReturnValue('formatted prompt');
    (ollamaService.callOllama as jest.Mock).mockResolvedValue(ollamaResponse);
    (ollamaService.parseAction as jest.Mock).mockReturnValue(parsedAction);
    (mcpClientService.handleEchoAction as jest.Mock).mockResolvedValue(undefined);

    await startInteractiveClient(mockClient as unknown as Client);

    expect(promptService.createOllamaPrompt).toHaveBeenCalledWith(userInput);
    expect(ollamaService.callOllama).toHaveBeenCalledWith('formatted prompt');
    expect(ollamaService.parseAction).toHaveBeenCalledWith(ollamaResponse);
    expect(mcpClientService.handleEchoAction).toHaveBeenCalledWith(mockClient, parsedAction.params.message);
  });

  test('handles bmi action correctly', async () => {
    const userInput = 'calculate bmi';
    const ollamaResponse = '[ACTION:bmi][WEIGHT:70][HEIGHT:1.75]';
    const parsedAction = {
      action: 'bmi',
      params: { weightKg: 70, heightM: 1.75 }
    };

    (readlineSync.question as jest.Mock).mockReturnValueOnce(userInput).mockReturnValueOnce('exit');
    (promptService.createOllamaPrompt as jest.Mock).mockReturnValue('formatted prompt');
    (ollamaService.callOllama as jest.Mock).mockResolvedValue(ollamaResponse);
    (ollamaService.parseAction as jest.Mock).mockReturnValue(parsedAction);
    (mcpClientService.handleBmiAction as jest.Mock).mockResolvedValue(undefined);

    await startInteractiveClient(mockClient as unknown as Client);

    expect(promptService.createOllamaPrompt).toHaveBeenCalledWith(userInput);
    expect(ollamaService.callOllama).toHaveBeenCalledWith('formatted prompt');
    expect(ollamaService.parseAction).toHaveBeenCalledWith(ollamaResponse);
    expect(mcpClientService.handleBmiAction).toHaveBeenCalledWith(mockClient, parsedAction.params.weightKg, parsedAction.params.heightM);
  });

  test('handles greeting action correctly', async () => {
    const userInput = 'greet John';
    const ollamaResponse = '[ACTION:greeting][NAME:John]';
    const parsedAction = {
      action: 'greeting',
      params: { name: 'John' }
    };

    (readlineSync.question as jest.Mock).mockReturnValueOnce(userInput).mockReturnValueOnce('exit');
    (promptService.createOllamaPrompt as jest.Mock).mockReturnValue('formatted prompt');
    (ollamaService.callOllama as jest.Mock).mockResolvedValue(ollamaResponse);
    (ollamaService.parseAction as jest.Mock).mockReturnValue(parsedAction);
    (mcpClientService.handleGreetingAction as jest.Mock).mockResolvedValue(undefined);

    await startInteractiveClient(mockClient as unknown as Client);

    expect(promptService.createOllamaPrompt).toHaveBeenCalledWith(userInput);
    expect(ollamaService.callOllama).toHaveBeenCalledWith('formatted prompt');
    expect(ollamaService.parseAction).toHaveBeenCalledWith(ollamaResponse);
    expect(mcpClientService.handleGreetingAction).toHaveBeenCalledWith(mockClient, parsedAction.params.name);
  });

  test('handles unknown action gracefully', async () => {
    const userInput = 'unknown command';
    const ollamaResponse = 'Invalid command';
    const parsedAction = {
      action: 'unknown',
      params: {}
    };

    (readlineSync.question as jest.Mock).mockReturnValueOnce(userInput).mockReturnValueOnce('exit');
    (promptService.createOllamaPrompt as jest.Mock).mockReturnValue('formatted prompt');
    (ollamaService.callOllama as jest.Mock).mockResolvedValue(ollamaResponse);
    (ollamaService.parseAction as jest.Mock).mockReturnValue(parsedAction);

    await startInteractiveClient(mockClient as unknown as Client);

    expect(promptService.createOllamaPrompt).toHaveBeenCalledWith(userInput);
    expect(ollamaService.callOllama).toHaveBeenCalledWith('formatted prompt');
    expect(ollamaService.parseAction).toHaveBeenCalledWith(ollamaResponse);
  });

  test('handles errors gracefully', async () => {
    const userInput = 'trigger error';
    
    (readlineSync.question as jest.Mock).mockReturnValueOnce(userInput).mockReturnValueOnce('exit');
    (promptService.createOllamaPrompt as jest.Mock).mockReturnValue('formatted prompt');
    (ollamaService.callOllama as jest.Mock).mockRejectedValue(new Error('API Error'));

    await expect(startInteractiveClient(mockClient as unknown as Client)).rejects.toThrow('API Error');

    expect(promptService.createOllamaPrompt).toHaveBeenCalledWith(userInput);
    expect(ollamaService.callOllama).toHaveBeenCalledWith('formatted prompt');
  });
}); 