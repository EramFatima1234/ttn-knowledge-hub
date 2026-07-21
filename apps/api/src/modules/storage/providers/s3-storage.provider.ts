import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { StorageFileInput, StorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const { region, accessKeyId, secretAccessKey, endpoint } = this.config;

    this.client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
    });
  }

  private get config() {
    return this.configService.get('storage.s3') as {
      bucket: string;
      region: string;
      accessKeyId?: string;
      secretAccessKey?: string;
      endpoint?: string;
    };
  }

  private normalizePath(path: string): string {
    return path.replace(/^\/+/, '').replace(/\\/g, '/');
  }

  async upload(file: StorageFileInput, path: string): Promise<string> {
    const key = this.normalizePath(path);
    const { bucket } = this.config;

    if (!bucket) {
      throw new Error('AWS_S3_BUCKET is required when STORAGE_PROVIDER=S3');
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
      }),
    );

    this.logger.log(`Uploaded ${key} to s3://${bucket}/${key}`);
    return key;
  }

  async delete(path: string): Promise<void> {
    const key = this.normalizePath(path);
    const { bucket } = this.config;

    if (!bucket) return;

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.warn(`Failed to delete s3://${bucket}/${key}`, error);
    }
  }

  getUrl(path: string): string {
    const normalized = this.normalizePath(path);
    const { bucket, region, endpoint } = this.config;

    if (endpoint) {
      return `${endpoint.replace(/\/$/, '')}/${bucket}/${normalized}`;
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${normalized}`;
  }
}
