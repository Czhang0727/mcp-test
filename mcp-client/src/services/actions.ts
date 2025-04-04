interface ActionParams {
  message?: string;
  weightKg?: number;
  heightM?: number;
  name?: string;
  code?: string;
}

export async function executeAction(action: string, params: ActionParams): Promise<string> {
  switch (action) {
    case 'echo':
      if (!params.message) {
        return 'Error: Missing message parameter';
      }
      return params.message;

    case 'bmi':
      if (!params.weightKg || !params.heightM) {
        return 'Error: Missing weight or height parameters';
      }
      if (typeof params.weightKg !== 'number' || typeof params.heightM !== 'number') {
        return 'Error: Invalid weight or height parameters';
      }
      const bmi = params.weightKg / (params.heightM * params.heightM);
      return `Your BMI is ${bmi.toFixed(2)}`;

    case 'greeting':
      if (!params.name) {
        return 'Error: Missing name parameter';
      }
      return `Hello, ${params.name}!`;

    case 'code-review':
      if (!params.code) {
        return 'Error: Missing code parameter';
      }
      return `Code Review Results:\n${params.code}\n\nNo issues found.`;

    case 'list':
      return `Available actions:
- echo: Echo a message
- bmi: Calculate BMI
- greeting: Get a personalized greeting
- code-review: Review code
- list: Show this list`;

    default:
      return `Unknown action: ${action}`;
  }
} 