import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class SpeakersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const speakers = await this.prisma.speaker.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { videos: true, knowledgeMeets: true } },
      },
    });

    return {
      data: speakers.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug ?? slugify(s.name),
        designation: s.designation,
        avatarUrl: s.avatarUrl,
        sessionCount: s._count.videos + s._count.knowledgeMeets,
      })),
    };
  }

  async getProfile(slugOrId: string, userId?: string) {
    let speaker = await this.prisma.speaker.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: {
        videos: {
          where: { status: 'PUBLISHED', deletedAt: null },
          include: { competency: true, ratings: true },
          orderBy: { publishedAt: 'desc' },
        },
        knowledgeMeets: {
          where: { deletedAt: null, visibility: { not: 'RESTRICTED' } },
          include: { competency: true, recording: true },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
        followers: userId
          ? { where: { userId }, select: { userId: true } }
          : undefined,
        _count: { select: { followers: true } },
      },
    });

    if (!speaker) {
      const candidates = await this.prisma.speaker.findMany({
        include: {
          videos: {
            where: { status: 'PUBLISHED', deletedAt: null },
            include: { competency: true, ratings: true },
            orderBy: { publishedAt: 'desc' },
          },
          knowledgeMeets: {
            where: { deletedAt: null, visibility: { not: 'RESTRICTED' } },
            include: { competency: true, recording: true },
            orderBy: { scheduledAt: 'desc' },
            take: 10,
          },
          followers: userId
            ? { where: { userId }, select: { userId: true } }
            : undefined,
          _count: { select: { followers: true } },
        },
      });
      speaker =
        candidates.find((s) => (s.slug ?? slugify(s.name)) === slugOrId) ?? null;
    }

    if (!speaker) throw new NotFoundException('Speaker not found');

    const ratings = speaker.videos.flatMap((v) => v.ratings);
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10
        : null;

    const competencies = [
      ...new Map(
        [
          ...speaker.videos.map((v) => v.competency),
          ...speaker.knowledgeMeets.map((m) => m.competency),
        ]
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map((c) => [c.id, c] as const),
      ).values(),
    ];

    const seriesList = await this.prisma.knowledgeSeries.findMany({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        sessions: {
          some: {
            video: {
              speakerId: speaker.id,
              status: ContentStatus.PUBLISHED,
              deletedAt: null,
            },
          },
        },
      },
      include: {
        competency: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return {
      data: {
        id: speaker.id,
        name: speaker.name,
        slug: speaker.slug ?? slugify(speaker.name),
        designation: speaker.designation,
        avatarUrl: speaker.avatarUrl,
        bio: speaker.bio,
        linkedinUrl: speaker.linkedinUrl,
        avgRating,
        followerCount: speaker._count.followers,
        isFollowing: Boolean(
          userId &&
            speaker.followers &&
            Array.isArray(speaker.followers) &&
            speaker.followers.length > 0,
        ),
        competencies: competencies.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
        recentSessions: speaker.videos.slice(0, 12).map((v) => ({
          id: v.id,
          title: v.title,
          thumbnailUrl: v.thumbnailUrl,
          durationSeconds: v.durationSeconds,
          publishedAt: v.publishedAt?.toISOString() ?? null,
          competency: v.competency?.name ?? null,
        })),
        recentMeets: speaker.knowledgeMeets.map((m) => ({
          id: m.id,
          title: m.title,
          scheduledAt: m.scheduledAt.toISOString(),
          status: m.status,
          thumbnailUrl: m.thumbnailUrl,
          competency: m.competency?.name ?? null,
          videoId: m.videoId,
          hasRecording: m.recording?.status === ContentStatus.PUBLISHED,
        })),
        recentSeries: seriesList.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          thumbnailUrl: s.thumbnailUrl,
          sessionCount: s.sessions.length,
          competency: s.competency?.name ?? null,
        })),
      },
    };
  }
}
