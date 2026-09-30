import type { MaintenanceRequest } from './maintenanceRequest.js';

export interface BulkImportValidationErrorDetail {
  field: string;
  message: string;
}

export interface BulkImportError {
  code: string;
  message: string;
  details?: BulkImportValidationErrorDetail[];
}

export interface BulkImportCreatedResult {
  index: number;
  status: 'created';
  data: MaintenanceRequest;
}

export interface BulkImportFailedResult {
  index: number;
  status: 'failed';
  error: BulkImportError;
}

export type BulkImportItemResult =
  | BulkImportCreatedResult
  | BulkImportFailedResult;

export interface BulkImportResult {
  total: number;
  created: number;
  failed: number;
  results: BulkImportItemResult[];
}