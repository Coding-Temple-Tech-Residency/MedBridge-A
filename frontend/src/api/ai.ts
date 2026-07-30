import { apiClient } from './client';

export type ChatRequest = {
  user_id: number;
  document_id: number;
  message: string;
};

export type ChatResponse = {
  session_id: number;
  message_id: number;
  response: string;
  created_at: string;
};

export async function chatWithDocument(payload: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/api/v1/ai/chat', payload);
  return response.data;
}
