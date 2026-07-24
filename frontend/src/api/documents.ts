import { apiClient } from './client';

export type DocumentUploadResponse = {
  document_id: number;
  filename: string;
  file_type: string;
  storage_path: string;
  preview: string;
};

export async function uploadDocument(
  file: File,
): Promise<DocumentUploadResponse> {
  const formData = new FormData();

  formData.append('file', file);

  const response = await apiClient.upload<DocumentUploadResponse>(
    '/api/v1/documents/upload',
    formData,
  );

  return response.data;
}
