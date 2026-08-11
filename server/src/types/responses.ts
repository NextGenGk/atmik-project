export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export function ok<T>(data: T, message = "OK"): SuccessResponse<T> {
  return { success: true, message, data };
}

export function okPaginated<T>(
  data: T,
  pagination: PaginationMeta,
  message = "OK"
): SuccessResponse<T> {
  return { success: true, message, data, pagination };
}
