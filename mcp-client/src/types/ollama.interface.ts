// Types for Ollama API
export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
} 