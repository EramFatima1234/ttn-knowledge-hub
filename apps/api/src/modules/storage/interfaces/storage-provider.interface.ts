export interface StorageFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

/**
 * Provider contract for object storage.
 * Swap LocalStorageProvider with S3StorageProvider without changing controllers.
 */
export interface StorageProvider {
  upload(file: StorageFileInput, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface StorageUploadResult {
  path: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  provider: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  path: string;
  expiresIn: number;
}
