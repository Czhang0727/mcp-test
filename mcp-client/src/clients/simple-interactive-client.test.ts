/**
 * @jest-environment node
 */
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('readline-sync', () => ({
  question: jest.fn()
}));

// Create mock client
const mockClient = {
  connect: jest.fn().mockResolvedValue(undefined as void),
  callTool: jest.fn().mockResolvedValue(''),
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

// Import dependencies after mocking
import readlineSync from 'readline-sync';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { startSimpleInteractiveClient } from './simple-interactive-client.js';

describe('Simple Interactive Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mocked modules are available', () => {
    expect(readlineSync.question).toBeDefined();
    expect(Client).toBeDefined();
  });

  test('handles user input correctly', async () => {
    // Mock user input
    (readlineSync.question as jest.Mock)
      .mockReturnValueOnce('test message')  // First input
      .mockReturnValueOnce('exit');         // Second input to exit

    // Mock client responses
    mockClient.callTool.mockResolvedValue('Echo: Test message');
    mockClient.readResource.mockResolvedValue('Hello, John!');
    mockClient.getPrompt.mockResolvedValue('Code Review Template');
    mockClient.listResources.mockResolvedValue(['greeting://John', 'greeting://Alice']);

    await startSimpleInteractiveClient(mockClient as unknown as Client);

    // Verify interactions
    expect(readlineSync.question).toHaveBeenCalledTimes(2);
    expect(mockClient.connect).toHaveBeenCalled();
  });

  test('handles errors gracefully', async () => {
    // Mock user input
    (readlineSync.question as jest.Mock)
      .mockReturnValueOnce('test message')  // First input
      .mockReturnValueOnce('exit');         // Second input to exit

    // Mock client error
    mockClient.connect.mockRejectedValue(new Error('Connection failed'));

    await expect(startSimpleInteractiveClient(mockClient as unknown as Client))
      .rejects
      .toThrow('Connection failed');
  });
}); 