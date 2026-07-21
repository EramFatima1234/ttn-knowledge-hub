import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import type { StorageFileInput, StorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;
  private readonly publicPrefix: string;

  constructor(private readonly configService: ConfigService) {
    const configured =
      this.configService.get<string>('storage.localPath') ?? './storage';
    this.basePath = resolve(process.cwd(), configured);
    this.publicPrefix =
      this.configService.get<string>('storage.publicUrlPrefix') ?? '/storage';
  }

  resolveAbsolutePath(relativePath: string): string {
    return join(this.basePath, this.normalizePath(relativePath));
  }

  async upload(file: StorageFileInput, relativePath: string): Promise<string> {
    const path = this.normalizePath(relativePath);
    const absolute = this.resolveAbsolutePath(path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, file.buffer);
    return path;
  }

  async delete(relativePath: string): Promise<void> {
    try {
      await unlink(this.resolveAbsolutePath(relativePath));
    } catch {
      // File may already be removed in local dev
    }
  }

  getUrl(relativePath: string): string {
    const normalized = this.normalizePath(relativePath);
    return `${this.publicPrefix}/${normalized}`.replace(/\/{2,}/g, '/');
  }

  private normalizePath(relativePath: string): string {
    return relativePath.replace(/^\/+/, '').replace(/\\/g, '/');
  }
}
