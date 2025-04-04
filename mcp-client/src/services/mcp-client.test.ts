import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { 
  handleEchoAction,
  handleBmiAction,
  handleGreetingAction,
  handleCodeReviewAction,
  handleListResourcesAction
} from './mcp-client.js';

// Create a mock Client
const mockClient = {
  callTool: jest.fn(),
  readResource: jest.fn(),
  getPrompt: jest.fn(),
  listResources: jest.fn()
};

describe('MCP Client Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('handleEchoAction', () => {
    test('should call echo tool with correct message', async () => {
      mockClient.callTool.mockResolvedValue('Echo: Hello');
      
      await handleEchoAction(mockClient as any, 'Hello');
      
      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'echo',
        arguments: { message: 'Hello' }
      });
      expect(console.log).toHaveBeenCalledWith('Echo result:', 'Echo: Hello');
    });

    test('should handle error when calling echo tool', async () => {
      mockClient.callTool.mockRejectedValue(new Error('Tool execution failed'));
      
      await handleEchoAction(mockClient as any, 'Hello');
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleBmiAction', () => {
    test('should call BMI tool with correct parameters', async () => {
      mockClient.callTool.mockResolvedValue('BMI: 22.86');
      
      await handleBmiAction(mockClient as any, 70, 1.75);
      
      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'calculate-bmi',
        arguments: { weightKg: 70, heightM: 1.75 }
      });
      expect(console.log).toHaveBeenCalledWith('BMI result:', 'BMI: 22.86');
    });

    test('should handle error when calling BMI tool', async () => {
      mockClient.callTool.mockRejectedValue(new Error('Tool execution failed'));
      
      await handleBmiAction(mockClient as any, 70, 1.75);
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleGreetingAction', () => {
    test('should read greeting resource with correct name', async () => {
      mockClient.readResource.mockResolvedValue('Hello, John!');
      
      await handleGreetingAction(mockClient as any, 'John');
      
      expect(mockClient.readResource).toHaveBeenCalledWith({
        uri: 'greeting://John'
      });
      expect(console.log).toHaveBeenCalledWith('Greeting result:', 'Hello, John!');
    });

    test('should handle error when reading greeting resource', async () => {
      mockClient.readResource.mockRejectedValue(new Error('Resource not found'));
      
      await handleGreetingAction(mockClient as any, 'John');
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleCodeReviewAction', () => {
    test('should get code review prompt with correct code', async () => {
      const code = 'function test() { return true; }';
      mockClient.getPrompt.mockResolvedValue('Code looks good!');
      
      await handleCodeReviewAction(mockClient as any, code);
      
      expect(mockClient.getPrompt).toHaveBeenCalledWith({
        name: 'code-review',
        arguments: { code }
      });
      expect(console.log).toHaveBeenCalledWith('Code review template:', 'Code looks good!');
    });

    test('should handle error when getting code review prompt', async () => {
      mockClient.getPrompt.mockRejectedValue(new Error('Prompt not found'));
      
      await handleCodeReviewAction(mockClient as any, 'code');
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleListResourcesAction', () => {
    test('should list resources with greeting schema', async () => {
      mockClient.listResources.mockResolvedValue(['greeting://John', 'greeting://Alice']);
      
      await handleListResourcesAction(mockClient as any);
      
      expect(mockClient.listResources).toHaveBeenCalledWith({
        schema: 'greeting'
      });
      expect(console.log).toHaveBeenCalledWith(
        'Available resources:',
        ['greeting://John', 'greeting://Alice']
      );
    });

    test('should handle error when listing resources', async () => {
      mockClient.listResources.mockRejectedValue(new Error('Failed to list resources'));
      
      await handleListResourcesAction(mockClient as any);
      
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 