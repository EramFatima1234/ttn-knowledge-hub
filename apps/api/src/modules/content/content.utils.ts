import { ContentStatus } from '@prisma/client';

export const videoInclude = {
  speaker: true,
  competency: true,
  category: true,
  tags: { include: { tag: true } },
  repository: true,
  attachments: true,
  seriesSessions: {
    include: { series: true },
    take: 1,
  },
} as const;

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function calcProgressPercent(
  progressSeconds: number,
  durationSeconds: number,
): number {
  if (!durationSeconds) return 0;
  return Math.min(100, Math.round((progressSeconds / durationSeconds) * 100));
}

export const publishedFilter = {
  status: ContentStatus.PUBLISHED,
  deletedAt: null,
};
