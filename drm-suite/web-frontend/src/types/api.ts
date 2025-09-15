/**
 * API共通の型定義
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

export interface FileUploadResponse {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
}