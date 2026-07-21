export const STORAGE_CATEGORIES = [
  "videos",
  "thumbnails",
  "banners",
  "resources",
  "speakers",
] as const;

export type StorageCategory = (typeof STORAGE_CATEGORIES)[number];

export interface UploadResult {
  path: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  provider?: string;
}

export async function uploadFile(
  file: File,
  category: StorageCategory,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { user } = await import("@/store/useAuthStore").then((m) =>
    m.useAuthStore.getState(),
  );

  const response = await fetch(
    `/api/uploads/file?category=${encodeURIComponent(category)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: formData,
    },
  );

  if (!response.ok) {
    let message = "Upload failed";
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const json = await response.json();
  const data = json.data as UploadResult & { key?: string };

  return {
    path: data.path ?? data.key ?? "",
    url: data.url,
    mimeType: data.mimeType,
    sizeBytes: data.sizeBytes,
    provider: data.provider,
  };
}
