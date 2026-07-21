import { registerAs } from '@nestjs/config';
import { normalizeGeminiApiKey } from '../modules/ai/gemini-key.util';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN ?? 'tothenew.com',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

export const googleConfig = registerAs('google', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
}));

export const storageConfig = registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER ?? 'LOCAL',
  localPath: process.env.STORAGE_LOCAL_PATH ?? './storage',
  publicUrlPrefix: process.env.STORAGE_PUBLIC_URL_PREFIX ?? '/storage',
  s3: {
    bucket: process.env.AWS_S3_BUCKET ?? '',
    region: process.env.AWS_S3_REGION ?? 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    endpoint: process.env.AWS_S3_ENDPOINT ?? '',
  },
}));

export const searchConfig = registerAs('search', () => ({
  provider: process.env.SEARCH_PROVIDER ?? 'postgres',
  elasticsearchUrl: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
  indexName: process.env.ELASTICSEARCH_INDEX ?? 'knowledgehub_content',
}));

export const mailConfig = registerAs('mail', () => ({
  provider: process.env.MAIL_PROVIDER ?? 'console',
  from: process.env.MAIL_FROM ?? 'KnowledgeHub <noreply@tothenew.com>',
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
}));

export const pushConfig = registerAs('push', () => ({
  provider: process.env.PUSH_PROVIDER ?? 'console',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? '',
  vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:knowledgehub@tothenew.com',
}));

export const aiConfig = registerAs('ai', () => {
  const geminiApiKey =
    normalizeGeminiApiKey(process.env.GEMINI_API_KEY) ||
    normalizeGeminiApiKey(process.env.GOOGLE_AI_API_KEY);

  return {
    provider: process.env.AI_PROVIDER ?? 'gemini',
    geminiApiKey,
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  };
});
