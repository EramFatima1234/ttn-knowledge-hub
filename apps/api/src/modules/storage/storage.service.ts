import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { StorageCategory } from './constants/storage-categories';
import {
  validateStorageFileSize,
} from './constants/storage-limits';
import {
  STORAGE_PROVIDER,
  type PresignedUploadResult,
  type StorageProvider,
  type StorageUploadResult,
} from './interfaces/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';

interface MultipartFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class StorageService {
  private readonly providerName: string;

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider,
    private readonly configService: ConfigService,
  ) {
    this.providerName =
      this.configService.get<string>('storage.provider') ?? 'LOCAL';
  }

  generatePath(category: StorageCategory, originalName: string): string {
    const extension = extname(originalName) || '';
    return `${category}/${randomUUID()}${extension}`;
  }

  async uploadMultipart(
    file: MultipartFile,
    category: StorageCategory,
  ): Promise<StorageUploadResult> {
    const sizeError = validateStorageFileSize(category, file.buffer.length);
    if (sizeError) {
      throw new BadRequestException(sizeError);
    }

    const relativePath = this.generatePath(category, file.originalname);
    const path = await this.provider.upload(
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
      relativePath,
    );

    return {
      path,
      url: this.provider.getUrl(path),
      mimeType: file.mimetype,
      sizeBytes: file.buffer.length,
      provider: this.providerName,
    };
  }

  async delete(path: string): Promise<void> {
    return this.provider.delete(path);
  }

  getUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return this.provider.getUrl(path);
  }

  resolveAbsolutePath(path: string): string | null {
    if (this.provider instanceof LocalStorageProvider) {
      return this.provider.resolveAbsolutePath(path);
    }
    return null;
  }

  isLocalProvider(): boolean {
    return this.provider instanceof LocalStorageProvider;
  }

  getProviderName(): string {
    return this.providerName;
  }

  async getPresignedUploadUrl(
    category: StorageCategory,
    fileName: string,
    mimeType: string,
    expiresIn = 3600,
  ): Promise<PresignedUploadResult> {
    const path = this.generatePath(category, fileName);

    if (this.isLocalProvider()) {
      return {
        uploadUrl: `/api/v1/uploads/file?category=${category}`,
        path,
        expiresIn,
      };
    }

    return {
      uploadUrl: this.provider.getUrl(path),
      path,
      expiresIn,
    };
  }
}
