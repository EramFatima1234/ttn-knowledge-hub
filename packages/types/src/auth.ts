export enum RoleName {
  ADMIN = 'ADMIN',
  TEAM = 'TEAM',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum MeetStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AttendanceType {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  RESTRICTED = 'RESTRICTED',
}

export enum ContentType {
  VIDEO = 'VIDEO',
  KNOWLEDGE_MEET = 'KNOWLEDGE_MEET',
  KNOWLEDGE_SERIES = 'KNOWLEDGE_SERIES',
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  AZURE = 'AZURE',
  MINIO = 'MINIO',
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: RoleName[];
}

export interface AuthTokensResponse {
  accessToken: string;
  user: AuthUser;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export const ALLOWED_EMAIL_DOMAIN = 'tothenew.com';

export const DOMAIN_RESTRICTION_MESSAGE =
  'This platform is only accessible for TO THE NEW employees.';
