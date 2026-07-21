# MVP Storage Strategy

KnowledgeHub uses a provider-based storage layer so local filesystem storage can be swapped for S3 later without changing controllers or the frontend contract.

## Layout

```
apps/api/storage/
  videos/
  thumbnails/
  banners/
  resources/
  speakers/
```

Uploaded files are stored on disk under `STORAGE_LOCAL_PATH` (default `./storage` relative to the API process). Only **relative paths** and **public URLs** are persisted in PostgreSQL.

## Provider contract

```typescript
interface StorageProvider {
  upload(file, path): Promise<string>;  // returns relative path
  delete(path): Promise<void>;
  getUrl(path): string;                 // public URL for clients
}
```

Implementations:

| Provider | File | Use case |
|----------|------|----------|
| `LocalStorageProvider` | `providers/local-storage.provider.ts` | Localhost / GitLab VM |
| `S3StorageProvider` | `providers/s3-storage.provider.ts` | Future production (stub) |

`StorageService` is the only entry point used by controllers and domain services.

## API upload

`POST /api/v1/uploads/file?category=videos|thumbnails|banners|resources|speakers`

Response:

```json
{
  "data": {
    "path": "videos/uuid.mp4",
    "url": "/storage/videos/uuid.mp4",
    "mimeType": "video/mp4",
    "sizeBytes": 12345,
    "provider": "LOCAL"
  }
}
```

## Serving files

- API static route: `/storage/*` → `apps/api/storage/`
- Legacy route: `/uploads/*` (pre-migration files)
- Next.js rewrites proxy `/storage/*` and `/api/*` to the API

## Frontend

Use `uploadFile(file, category)` from `apps/web/src/lib/upload.ts`. Components consume **URLs only** — never filesystem paths.

## Configuration

```env
STORAGE_PROVIDER=LOCAL
STORAGE_LOCAL_PATH=./storage
STORAGE_PUBLIC_URL_PREFIX=/storage
```

Set `STORAGE_PROVIDER=S3` and AWS variables when wiring the S3 provider for production.

## Swapping to S3

1. Implement real upload/delete in `S3StorageProvider` (AWS SDK).
2. Set `STORAGE_PROVIDER=S3` and bucket credentials.
3. No controller or frontend changes required — URLs become absolute S3/CDN URLs via `getUrl()`.
