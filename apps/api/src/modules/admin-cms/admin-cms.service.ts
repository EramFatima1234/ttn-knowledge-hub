import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceType,
  ContentStatus,
  MeetStatus,
  Prisma,
  ResourceKind,
  SessionDifficulty,
  Visibility,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationDeliveryService } from '../notifications/notification-delivery.service';
import { SearchIndexService } from '../search/search-index.service';
import {
  cmsStatusToContentStatus,
  cmsStatusToMeetFields,
  meetToCmsStatus,
  seriesToCmsStatus,
  type CmsPublishStatus,
} from './utils/cms-status.util';
import { slugify } from './utils/slug.util';
import { normalizeHomepageTag } from '../../common/utils/media-url.util';
import { CreateCompetencyDto, UpdateCompetencyDto } from './dto/competency.dto';
import { CreateMeetDto, UpdateMeetDto } from './dto/meet.dto';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';
import {
  CreateEpisodeDto,
  CreateSeriesDto,
  UpdateEpisodeDto,
  UpdateSeriesDto,
} from './dto/series.dto';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto/speaker.dto';
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_PLATFORM_SETTINGS,
  type HomepageSectionDto,
  type PlatformSettingsDto,
} from './constants/cms-defaults';
import { UpdateHomepageLayoutDto } from './dto/homepage.dto';
import { UpdatePlatformSettingsDto } from './dto/platform-settings.dto';
import { UploadMeetRecordingDto } from './dto/team-meet.dto';

const meetInclude = {
  speaker: true,
  competency: true,
  recording: {
    select: {
      id: true,
      title: true,
      videoUrl: true,
      storageKey: true,
      thumbnailUrl: true,
      status: true,
      publishedAt: true,
    },
  },
} as const;

@Injectable()
export class AdminCmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationDelivery: NotificationDeliveryService,
    private readonly searchIndexService: SearchIndexService,
  ) {}

  private rethrowDeleteError(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new ConflictException(message);
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Record not found');
      }
    }

    throw error;
  }

  private resolveCmsStatus(value?: string): CmsPublishStatus {
    const normalized = (value ?? 'PUBLISHED').toUpperCase() as CmsPublishStatus;
    if (['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING'].includes(normalized)) {
      return normalized;
    }
    return 'PUBLISHED';
  }

  private mapResourceKind(type?: string): ResourceKind {
    const map: Record<string, ResourceKind> = {
      PDF: ResourceKind.PDF,
      SLIDES: ResourceKind.SLIDES,
      GITHUB: ResourceKind.GITHUB_REPO,
      ZIP: ResourceKind.OTHER,
      EXTERNAL: ResourceKind.LINK,
      DOCUMENTATION: ResourceKind.DOCUMENTATION,
    };
    return map[type ?? ''] ?? ResourceKind.OTHER;
  }

  private normalizeTags(tags?: string[]): string[] {
    return (tags ?? [])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  private normalizeHomepageTags(tags?: string[]): string[] {
    return [...new Set((tags ?? []).map((tag) => normalizeHomepageTag(tag)).filter(Boolean))];
  }

  private toAdminMeet(
    meet: Prisma.KnowledgeMeetGetPayload<{ include: typeof meetInclude }>,
  ) {
    return {
      id: meet.id,
      title: meet.title,
      subtitle: meet.subtitle,
      description: meet.description,
      speakerId: meet.speakerId,
      competencyId: meet.competencyId,
      speaker: meet.speaker
        ? {
            id: meet.speaker.id,
            name: meet.speaker.name,
            designation: meet.speaker.designation,
            avatarUrl: meet.speaker.avatarUrl,
          }
        : null,
      competency: meet.competency
        ? {
            id: meet.competency.id,
            name: meet.competency.name,
            slug: meet.competency.slug,
          }
        : null,
      scheduledAt: meet.scheduledAt.toISOString(),
      durationMinutes: meet.durationMinutes,
      meetingLink: meet.meetingLink,
      attendanceType: meet.attendanceType,
      mandatory: meet.attendanceType === AttendanceType.MANDATORY,
      thumbnailUrl: meet.thumbnailUrl,
      bannerUrl: meet.bannerUrl,
      recordingUrl: meet.recording?.videoUrl ?? meet.recordingUrl,
      videoId: meet.videoId,
      hasRecording: meet.recording?.status === ContentStatus.PUBLISHED,
      hasRecordingUpload: Boolean(meet.videoId),
      recordingStatus: meet.recording?.status ?? null,
      githubRepo: meet.repositoryUrl,
      slidesUrl: meet.presentationUrl,
      pdfResources: meet.pdfResourceUrl ? [meet.pdfResourceUrl] : [],
      externalResourceUrls: meet.externalResourceUrls ?? [],
      difficulty: meet.difficulty,
      tags: meet.tags ?? [],
      homepageTags: meet.homepageTags ?? [],
      displayPriority: meet.displayPriority,
      status: meetToCmsStatus(meet),
      source: 'api' as const,
      updatedAt: meet.updatedAt.toISOString(),
    };
  }

  // ─── Meets ───────────────────────────────────────────────────────────────

  async listMeets() {
    const items = await this.prisma.knowledgeMeet.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: meetInclude,
    });
    return { data: items.map((m) => this.toAdminMeet(m)) };
  }

  async getMeet(id: string) {
    const meet = await this.prisma.knowledgeMeet.findFirst({
      where: { id, deletedAt: null },
      include: meetInclude,
    });
    if (!meet) throw new NotFoundException('Meet not found');
    return { data: this.toAdminMeet(meet) };
  }

  async createMeet(dto: CreateMeetDto, userId: string) {
    const cmsStatus = this.resolveCmsStatus(dto.cmsStatus);
    const { meetStatus, visibility, softDelete } = cmsStatusToMeetFields(cmsStatus);

    const meet = await this.prisma.knowledgeMeet.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        description: dto.description,
        speakerId: dto.speakerId,
        competencyId: dto.competencyId,
        createdById: userId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes ?? 60,
        meetingLink: dto.meetingLink,
        thumbnailUrl: dto.thumbnailUrl,
        bannerUrl: dto.bannerUrl,
        recordingUrl: dto.recordingUrl,
        repositoryUrl: dto.repositoryUrl,
        presentationUrl: dto.presentationUrl,
        difficulty: dto.difficulty ?? SessionDifficulty.INTERMEDIATE,
        tags: this.normalizeTags(dto.tags),
        homepageTags: this.normalizeHomepageTags(dto.homepageTags),
        displayPriority: dto.displayPriority ?? 100,
        pdfResourceUrl: dto.pdfResourceUrl,
        externalResourceUrls: dto.externalResourceUrls ?? [],
        attendanceType: dto.mandatory
          ? AttendanceType.MANDATORY
          : dto.attendanceType ?? AttendanceType.OPTIONAL,
        status: meetStatus,
        visibility,
        deletedAt: softDelete ? new Date() : null,
      },
      include: meetInclude,
    });

    if (dto.recordingUrl?.trim() && cmsStatus === 'PUBLISHED') {
      const synced = await this.upsertMeetRecording(
        meet.id,
        {
          videoUrl: dto.recordingUrl.trim(),
          thumbnailUrl: dto.thumbnailUrl,
          durationMinutes: dto.durationMinutes,
          cmsStatus,
        },
        userId,
      );
      return synced;
    }

    return { data: this.toAdminMeet(meet) };
  }

  async updateMeet(id: string, dto: UpdateMeetDto) {
    const existing = await this.prisma.knowledgeMeet.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Meet not found');

    const cmsStatus = dto.cmsStatus
      ? this.resolveCmsStatus(dto.cmsStatus)
      : meetToCmsStatus(existing);
    const { meetStatus, visibility, softDelete } = cmsStatusToMeetFields(cmsStatus);

    const meet = await this.prisma.knowledgeMeet.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        subtitle: dto.subtitle ?? existing.subtitle,
        description: dto.description ?? existing.description,
        speakerId: dto.speakerId ?? existing.speakerId,
        competencyId: dto.competencyId ?? existing.competencyId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : existing.scheduledAt,
        durationMinutes: dto.durationMinutes ?? existing.durationMinutes,
        meetingLink: dto.meetingLink ?? existing.meetingLink,
        thumbnailUrl: dto.thumbnailUrl ?? existing.thumbnailUrl,
        bannerUrl: dto.bannerUrl ?? existing.bannerUrl,
        recordingUrl: dto.recordingUrl ?? existing.recordingUrl,
        repositoryUrl: dto.repositoryUrl ?? existing.repositoryUrl,
        presentationUrl: dto.presentationUrl ?? existing.presentationUrl,
        difficulty: dto.difficulty ?? existing.difficulty,
        tags: dto.tags ? this.normalizeTags(dto.tags) : existing.tags,
        homepageTags: dto.homepageTags
          ? this.normalizeHomepageTags(dto.homepageTags)
          : existing.homepageTags,
        displayPriority: dto.displayPriority ?? existing.displayPriority,
        pdfResourceUrl: dto.pdfResourceUrl ?? existing.pdfResourceUrl,
        externalResourceUrls:
          dto.externalResourceUrls ?? existing.externalResourceUrls,
        attendanceType:
          dto.mandatory !== undefined
            ? dto.mandatory
              ? AttendanceType.MANDATORY
              : AttendanceType.OPTIONAL
            : dto.attendanceType ?? existing.attendanceType,
        status: meetStatus,
        visibility,
        deletedAt: softDelete ? new Date() : null,
      },
      include: meetInclude,
    });

    const cmsStatusResolved = dto.cmsStatus
      ? this.resolveCmsStatus(dto.cmsStatus)
      : meetToCmsStatus(existing);

    const recordingUrl = dto.recordingUrl ?? existing.recordingUrl;
    if (recordingUrl?.trim() && cmsStatusResolved === 'PUBLISHED') {
      const synced = await this.upsertMeetRecording(
        id,
        {
          videoUrl: recordingUrl.trim(),
          thumbnailUrl: dto.thumbnailUrl ?? existing.thumbnailUrl ?? undefined,
          durationMinutes: dto.durationMinutes ?? existing.durationMinutes,
          cmsStatus: cmsStatusResolved,
        },
        existing.createdById,
      );
      return synced;
    }

    await this.searchIndexService.syncMeet(id);

    return { data: this.toAdminMeet(meet) };
  }

  async upsertMeetRecording(
    meetId: string,
    dto: {
      title?: string;
      description?: string;
      durationMinutes?: number;
      videoUrl?: string;
      storageKey?: string;
      thumbnailUrl?: string;
      cmsStatus?: string;
    },
    userId: string,
  ) {
    if (!dto.videoUrl && !dto.storageKey) {
      throw new BadRequestException('A recording URL or uploaded file is required');
    }

    const meet = await this.prisma.knowledgeMeet.findFirst({
      where: { id: meetId, deletedAt: null },
      include: { recording: true, speaker: true, competency: true },
    });
    if (!meet) throw new NotFoundException('Meet not found');

    const videoStatus = dto.cmsStatus
      ? cmsStatusToContentStatus(this.resolveCmsStatus(dto.cmsStatus))
      : ContentStatus.PENDING_APPROVAL;

    const videoTitle = dto.title ?? meet.title;
    const videoDescription =
      dto.description ?? meet.description ?? meet.subtitle ?? undefined;
    const durationSeconds = (dto.durationMinutes ?? meet.durationMinutes) * 60;
    const thumbnailUrl = dto.thumbnailUrl ?? meet.thumbnailUrl ?? undefined;

    let videoId = meet.videoId;

    if (meet.videoId && meet.recording) {
      const updated = await this.prisma.video.update({
        where: { id: meet.videoId },
        data: {
          title: videoTitle,
          description: videoDescription,
          speakerId: meet.speakerId,
          competencyId: meet.competencyId,
          videoUrl: dto.videoUrl ?? meet.recording.videoUrl,
          storageKey: dto.storageKey ?? meet.recording.storageKey,
          thumbnailUrl,
          durationSeconds,
          status: videoStatus,
          publishedAt:
            videoStatus === ContentStatus.PUBLISHED ? new Date() : meet.recording.publishedAt,
        },
      });
      videoId = updated.id;
    } else {
      const created = await this.prisma.video.create({
        data: {
          title: videoTitle,
          description: videoDescription,
          uploadedById: userId,
          speakerId: meet.speakerId,
          competencyId: meet.competencyId,
          videoUrl: dto.videoUrl,
          storageKey: dto.storageKey,
          thumbnailUrl,
          durationSeconds,
          status: videoStatus,
          publishedAt: videoStatus === ContentStatus.PUBLISHED ? new Date() : null,
        },
      });
      videoId = created.id;
    }

    const meetStatus =
      videoStatus === ContentStatus.PUBLISHED
        ? MeetStatus.COMPLETED
        : meet.status;

    const wasPublished =
      meet.recording?.status === ContentStatus.PUBLISHED
      && meet.status === MeetStatus.COMPLETED;

    const updatedMeet = await this.prisma.knowledgeMeet.update({
      where: { id: meetId },
      data: {
        videoId,
        recordingUrl: dto.videoUrl ?? meet.recordingUrl,
        thumbnailUrl: thumbnailUrl ?? meet.thumbnailUrl,
        status: meetStatus,
        visibility:
          videoStatus === ContentStatus.PUBLISHED
            ? Visibility.INTERNAL
            : meet.visibility,
      },
      include: meetInclude,
    });

    if (videoStatus === ContentStatus.PUBLISHED && !wasPublished) {
      await this.notifyMeetPublished(updatedMeet, videoId);
      await this.searchIndexService.syncMeet(meetId);
      await this.searchIndexService.syncVideo(videoId);
    }

    return { data: this.toAdminMeet(updatedMeet) };
  }

  private async notifyMeetPublished(
    meet: { id: string; title: string },
    videoId: string,
  ) {
    const settings = await this.getPlatformSettings();
    if (!settings.data.notifyNewSession) return;

    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });

    const actionUrl = `/watch/${videoId}`;
    const title = `New Knowledge Meet Available: ${meet.title}`;
    const body = 'A new Knowledge Meet has been published. Watch the recording now on KnowledgeHub.';

    await Promise.all(
      users.map((user) =>
        this.notificationDelivery.deliver({
          userId: user.id,
          type: 'MEET_PUBLISHED',
          title,
          body,
          payload: { meetId: meet.id, videoId },
          actionUrl,
        }),
      ),
    );
  }

  async listMeetsForContributors() {
    const items = await this.prisma.knowledgeMeet.findMany({
      where: {
        deletedAt: null,
        status: { not: MeetStatus.CANCELLED },
      },
      orderBy: { scheduledAt: 'desc' },
      include: meetInclude,
    });

    return {
      data: items.map((meet) => ({
        id: meet.id,
        title: meet.title,
        scheduledAt: meet.scheduledAt.toISOString(),
        durationMinutes: meet.durationMinutes,
        competency: meet.competency
          ? { id: meet.competency.id, name: meet.competency.name }
          : null,
        speaker: meet.speaker
          ? { id: meet.speaker.id, name: meet.speaker.name }
          : null,
        hasRecording: meet.recording?.status === ContentStatus.PUBLISHED,
        hasRecordingUpload: Boolean(meet.videoId),
        recordingStatus: meet.recording?.status ?? null,
      })),
    };
  }

  async deleteMeet(id: string) {
    await this.prisma.knowledgeMeet.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });
    return { success: true };
  }

  async duplicateMeet(id: string, userId: string) {
    const source = await this.prisma.knowledgeMeet.findFirst({
      where: { id, deletedAt: null },
    });
    if (!source) throw new NotFoundException('Meet not found');

    const meet = await this.prisma.knowledgeMeet.create({
      data: {
        title: `${source.title} (Copy)`,
        subtitle: source.subtitle,
        description: source.description,
        speakerId: source.speakerId,
        competencyId: source.competencyId,
        createdById: userId,
        scheduledAt: source.scheduledAt,
        durationMinutes: source.durationMinutes,
        meetingLink: source.meetingLink,
        thumbnailUrl: source.thumbnailUrl,
        bannerUrl: source.bannerUrl,
        repositoryUrl: source.repositoryUrl,
        presentationUrl: source.presentationUrl,
        difficulty: source.difficulty,
        tags: source.tags,
        homepageTags: source.homepageTags,
        displayPriority: source.displayPriority,
        pdfResourceUrl: source.pdfResourceUrl,
        externalResourceUrls: source.externalResourceUrls,
        attendanceType: source.attendanceType,
        status: MeetStatus.UPCOMING,
        visibility: Visibility.RESTRICTED,
      },
      include: meetInclude,
    });

    return { data: this.toAdminMeet(meet) };
  }

  // ─── Series ──────────────────────────────────────────────────────────────

  private toAdminSeries(
    series: Prisma.KnowledgeSeriesGetPayload<{
      include: { competency: true; sessions: true };
    }>,
  ) {
    const views = series.sessions.reduce(
      (sum, s) => sum + 0,
      0,
    );
    return {
      id: series.id,
      title: series.title,
      description: series.description,
      competencyId: series.competencyId,
      competency: series.competency
        ? {
            id: series.competency.id,
            name: series.competency.name,
            slug: series.competency.slug,
          }
        : null,
      thumbnailUrl: series.thumbnailUrl,
      bannerUrl: series.bannerUrl,
      tags: series.tags ?? [],
      homepageTags: series.homepageTags ?? [],
      displayPriority: series.displayPriority,
      publishedAt: series.publishedAt?.toISOString() ?? null,
      episodeCount: series.sessions.length,
      viewCount: views,
      level: 'INTERMEDIATE',
      status: seriesToCmsStatus(series.status),
      source: 'api' as const,
      updatedAt: series.updatedAt.toISOString(),
    };
  }

  async listSeries() {
    const items = await this.prisma.knowledgeSeries.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: { competency: true, sessions: true },
    });
    return { data: items.map((s) => this.toAdminSeries(s)) };
  }

  async getSeries(id: string) {
    const series = await this.prisma.knowledgeSeries.findFirst({
      where: { id, deletedAt: null },
      include: { competency: true, sessions: true },
    });
    if (!series) throw new NotFoundException('Series not found');
    return { data: this.toAdminSeries(series) };
  }

  async createSeries(dto: CreateSeriesDto, userId: string) {
    const status = dto.cmsStatus
      ? cmsStatusToContentStatus(this.resolveCmsStatus(dto.cmsStatus))
      : dto.status ?? ContentStatus.DRAFT;

    const series = await this.prisma.knowledgeSeries.create({
      data: {
        title: dto.title,
        description: dto.description,
        competencyId: dto.competencyId,
        thumbnailUrl: dto.thumbnailUrl,
        bannerUrl: dto.bannerUrl,
        tags: this.normalizeTags(dto.tags),
        homepageTags: this.normalizeHomepageTags(dto.homepageTags),
        displayPriority: dto.displayPriority ?? 100,
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
        createdById: userId,
      },
      include: { competency: true, sessions: true },
    });

    if (dto.episodeCount) {
      await this.ensureEpisodeSlots(series.id, dto.episodeCount);
      const refreshed = await this.prisma.knowledgeSeries.findFirst({
        where: { id: series.id },
        include: { competency: true, sessions: true },
      });
      return { data: this.toAdminSeries(refreshed!) };
    }

    return { data: this.toAdminSeries(series) };
  }

  async updateSeries(id: string, dto: UpdateSeriesDto) {
    const existing = await this.prisma.knowledgeSeries.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Series not found');

    const status = dto.cmsStatus
      ? cmsStatusToContentStatus(this.resolveCmsStatus(dto.cmsStatus))
      : dto.status ?? existing.status;

    const series = await this.prisma.knowledgeSeries.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        competencyId: dto.competencyId ?? existing.competencyId,
        thumbnailUrl: dto.thumbnailUrl ?? existing.thumbnailUrl,
        bannerUrl: dto.bannerUrl ?? existing.bannerUrl,
        tags: dto.tags ? this.normalizeTags(dto.tags) : existing.tags,
        homepageTags: dto.homepageTags
          ? this.normalizeHomepageTags(dto.homepageTags)
          : existing.homepageTags,
        displayPriority: dto.displayPriority ?? existing.displayPriority,
        status,
        publishedAt:
          status === ContentStatus.PUBLISHED
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,
      },
      include: { competency: true, sessions: true },
    });

    if (dto.episodeCount) {
      await this.ensureEpisodeSlots(id, dto.episodeCount);
      const refreshed = await this.prisma.knowledgeSeries.findFirst({
        where: { id },
        include: { competency: true, sessions: true },
      });
      return { data: this.toAdminSeries(refreshed!) };
    }

    return { data: this.toAdminSeries(series) };
  }

  async deleteSeries(id: string) {
    await this.prisma.knowledgeSeries.update({
      where: { id },
      data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED },
    });
    return { success: true };
  }

  // ─── Episodes ──────────────────────────────────────────────────────────

  private toAdminEpisode(
    session: Prisma.SeriesSessionGetPayload<{ include: { video: true } }>,
  ) {
    const status = session.video
      ? seriesToCmsStatus(session.video.status)
      : 'DRAFT';
    return {
      id: session.id,
      seriesId: session.seriesId,
      orderIndex: session.orderIndex,
      title: session.title,
      description: session.video?.description ?? null,
      durationMinutes: session.video
        ? Math.ceil(session.video.durationSeconds / 60)
        : undefined,
      videoUrl: session.video?.videoUrl ?? null,
      thumbnailUrl: session.video?.thumbnailUrl ?? null,
      hasVideo: Boolean(session.video?.videoUrl || session.video?.storageKey),
      status: status as CmsPublishStatus,
      updatedAt: session.createdAt.toISOString(),
    };
  }

  private async ensureEpisodeSlots(seriesId: string, count: number) {
    if (count < 1) return;

    const existing = await this.prisma.seriesSession.findMany({
      where: { seriesId },
      select: { orderIndex: true },
    });
    const occupied = new Set(existing.map((s) => s.orderIndex));

    const toCreate: Prisma.SeriesSessionCreateManyInput[] = [];
    for (let i = 1; i <= count; i += 1) {
      if (!occupied.has(i)) {
        toCreate.push({
          seriesId,
          title: `Episode ${i}`,
          orderIndex: i,
        });
      }
    }

    if (toCreate.length > 0) {
      await this.prisma.seriesSession.createMany({ data: toCreate });
    }
  }

  async listSeriesForContributors() {
    const items = await this.prisma.knowledgeSeries.findMany({
      where: {
        deletedAt: null,
        status: { not: ContentStatus.ARCHIVED },
      },
      orderBy: { title: 'asc' },
      include: {
        competency: true,
        sessions: { include: { video: true }, orderBy: { orderIndex: 'asc' } },
      },
    });

    return {
      data: items.map((series) => ({
        id: series.id,
        title: series.title,
        description: series.description,
        competency: series.competency
          ? { id: series.competency.id, name: series.competency.name }
          : null,
        episodeCount: series.sessions.length,
        uploadedCount: series.sessions.filter(
          (s) => s.video?.videoUrl || s.video?.storageKey,
        ).length,
      })),
    };
  }

  async upsertEpisodeAtSlot(
    seriesId: string,
    orderIndex: number,
    dto: CreateEpisodeDto & { cmsStatus?: string },
    userId: string,
  ) {
    if (orderIndex < 1) {
      throw new BadRequestException('Episode number must be at least 1');
    }

    const series = await this.prisma.knowledgeSeries.findFirst({
      where: { id: seriesId, deletedAt: null },
    });
    if (!series) throw new NotFoundException('Series not found');

    const status = dto.cmsStatus
      ? cmsStatusToContentStatus(this.resolveCmsStatus(dto.cmsStatus))
      : dto.status ?? ContentStatus.DRAFT;

    let session = await this.prisma.seriesSession.findFirst({
      where: { seriesId, orderIndex },
      include: { video: true },
    });

    if (!session) {
      session = await this.prisma.seriesSession.create({
        data: {
          seriesId,
          title: dto.title || `Episode ${orderIndex}`,
          orderIndex,
        },
        include: { video: true },
      });
    }

    if (session.videoId && session.video) {
      await this.prisma.video.update({
        where: { id: session.videoId },
        data: {
          title: dto.title ?? session.title,
          description: dto.description ?? session.video.description,
          videoUrl: dto.videoUrl ?? session.video.videoUrl,
          storageKey: dto.storageKey ?? session.video.storageKey,
          thumbnailUrl: dto.thumbnailUrl ?? session.video.thumbnailUrl,
          durationSeconds: dto.durationMinutes
            ? dto.durationMinutes * 60
            : session.video.durationSeconds,
          status,
        },
      });
    } else if (dto.videoUrl || dto.storageKey) {
      const video = await this.prisma.video.create({
        data: {
          title: dto.title ?? session.title,
          description: dto.description,
          uploadedById: userId,
          competencyId: series.competencyId,
          videoUrl: dto.videoUrl,
          storageKey: dto.storageKey,
          thumbnailUrl: dto.thumbnailUrl,
          durationSeconds: (dto.durationMinutes ?? 0) * 60,
          status,
        },
      });
      await this.prisma.seriesSession.update({
        where: { id: session.id },
        data: { videoId: video.id },
      });
    }

    const updated = await this.prisma.seriesSession.update({
      where: { id: session.id },
      data: { title: dto.title ?? session.title },
      include: { video: true },
    });

    return { data: this.toAdminEpisode(updated) };
  }

  async listEpisodes(seriesId: string) {
    const sessions = await this.prisma.seriesSession.findMany({
      where: { seriesId },
      orderBy: { orderIndex: 'asc' },
      include: { video: true },
    });
    return { data: sessions.map((s) => this.toAdminEpisode(s)) };
  }

  async createEpisode(seriesId: string, dto: CreateEpisodeDto, userId: string) {
    if (dto.orderIndex) {
      return this.upsertEpisodeAtSlot(seriesId, dto.orderIndex, dto, userId);
    }

    const series = await this.prisma.knowledgeSeries.findFirst({
      where: { id: seriesId, deletedAt: null },
    });
    if (!series) throw new NotFoundException('Series not found');

    const count = await this.prisma.seriesSession.count({ where: { seriesId } });
    const status = dto.cmsStatus
      ? cmsStatusToContentStatus(this.resolveCmsStatus(dto.cmsStatus))
      : dto.status ?? ContentStatus.DRAFT;

    let videoId: string | undefined;
    if (dto.videoUrl || dto.storageKey) {
      const video = await this.prisma.video.create({
        data: {
          title: dto.title,
          description: dto.description,
          uploadedById: userId,
          competencyId: series.competencyId,
          videoUrl: dto.videoUrl,
          storageKey: dto.storageKey,
          thumbnailUrl: dto.thumbnailUrl,
          durationSeconds: (dto.durationMinutes ?? 0) * 60,
          status,
        },
      });
      videoId = video.id;
    }

    const session = await this.prisma.seriesSession.create({
      data: {
        seriesId,
        title: dto.title,
        orderIndex: count + 1,
        videoId,
      },
      include: { video: true },
    });

    return { data: this.toAdminEpisode(session) };
  }

  async updateEpisode(
    seriesId: string,
    episodeId: string,
    dto: UpdateEpisodeDto,
    userId: string,
  ) {
    const session = await this.prisma.seriesSession.findFirst({
      where: { id: episodeId, seriesId },
      include: { video: true },
    });
    if (!session) throw new NotFoundException('Episode not found');

    const status = dto.cmsStatus
      ? cmsStatusToContentStatus(this.resolveCmsStatus(dto.cmsStatus))
      : dto.status;

    if (session.videoId && session.video) {
      await this.prisma.video.update({
        where: { id: session.videoId },
        data: {
          title: dto.title ?? session.title,
          description: dto.description ?? session.video.description,
          videoUrl: dto.videoUrl ?? session.video.videoUrl,
          storageKey: dto.storageKey ?? session.video.storageKey,
          thumbnailUrl: dto.thumbnailUrl ?? session.video.thumbnailUrl,
          durationSeconds: dto.durationMinutes
            ? dto.durationMinutes * 60
            : session.video.durationSeconds,
          ...(status ? { status } : {}),
        },
      });
    } else if (dto.videoUrl || dto.storageKey) {
      const video = await this.prisma.video.create({
        data: {
          title: dto.title ?? session.title,
          description: dto.description,
          uploadedById: userId,
          videoUrl: dto.videoUrl,
          storageKey: dto.storageKey,
          thumbnailUrl: dto.thumbnailUrl,
          durationSeconds: (dto.durationMinutes ?? 0) * 60,
          status: status ?? ContentStatus.DRAFT,
        },
      });
      await this.prisma.seriesSession.update({
        where: { id: episodeId },
        data: { videoId: video.id },
      });
    }

    const updated = await this.prisma.seriesSession.update({
      where: { id: episodeId },
      data: { title: dto.title ?? session.title },
      include: { video: true },
    });

    return { data: this.toAdminEpisode(updated) };
  }

  async deleteEpisode(seriesId: string, episodeId: string) {
    const session = await this.prisma.seriesSession.findFirst({
      where: { id: episodeId, seriesId },
    });
    if (!session) throw new NotFoundException('Episode not found');

    try {
      if (session.videoId) {
        await this.prisma.video.update({
          where: { id: session.videoId },
          data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED },
        });
      }

      await this.prisma.seriesSession.delete({ where: { id: episodeId } });
    } catch (error) {
      this.rethrowDeleteError(error, 'Cannot delete episode');
    }

    return { success: true };
  }

  async reorderEpisodes(seriesId: string, orderedIds: string[]) {
    const sessions = await this.prisma.seriesSession.findMany({
      where: { seriesId },
    });
    const idSet = new Set(sessions.map((s) => s.id));
    if (orderedIds.some((id) => !idSet.has(id))) {
      throw new BadRequestException('Invalid episode order');
    }

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.seriesSession.update({
          where: { id },
          data: { orderIndex: index + 1 },
        }),
      ),
    );

    return this.listEpisodes(seriesId);
  }

  // ─── Resources (standalone attachments) ──────────────────────────────────

  async listResources() {
    const items = await this.prisma.attachment.findMany({
      where: { videoId: null, meetId: null },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: items.map((r) => ({
        id: r.id,
        title: r.fileName,
        description: r.label,
        resourceType: r.resourceKind ?? 'OTHER',
        fileKey: r.fileKey,
        externalUrl: r.externalUrl,
        downloadCount: 0,
        status: r.fileKey || r.externalUrl ? 'PUBLISHED' : 'DRAFT',
        source: 'api' as const,
        updatedAt: r.createdAt.toISOString(),
        url: r.externalUrl ?? this.storageService.getUrl(r.fileKey),
      })),
    };
  }

  async createResource(dto: CreateResourceDto) {
    const fileKey = dto.fileKey ?? dto.fileUrl ?? '';
    const resource = await this.prisma.attachment.create({
      data: {
        fileName: dto.title,
        label: dto.description,
        fileKey,
        mimeType: dto.mimeType ?? 'application/octet-stream',
        sizeBytes: dto.sizeBytes ?? 0,
        resourceKind: dto.resourceKind ?? this.mapResourceKind(dto.resourceType),
        externalUrl: dto.externalUrl,
        storageProvider: this.storageService.getProviderName(),
      },
    });

    return {
      data: {
        id: resource.id,
        title: resource.fileName,
        description: resource.label,
        resourceType: resource.resourceKind,
        fileKey: resource.fileKey,
        externalUrl: resource.externalUrl,
        downloadCount: 0,
        status: 'PUBLISHED',
        source: 'api',
        updatedAt: resource.createdAt.toISOString(),
        url: resource.externalUrl ?? this.storageService.getUrl(resource.fileKey),
      },
    };
  }

  async updateResource(id: string, dto: UpdateResourceDto) {
    const existing = await this.prisma.attachment.findFirst({
      where: { id, videoId: null, meetId: null },
    });
    if (!existing) throw new NotFoundException('Resource not found');

    const resource = await this.prisma.attachment.update({
      where: { id },
      data: {
        fileName: dto.title ?? existing.fileName,
        label: dto.description ?? existing.label,
        fileKey: dto.fileKey ?? dto.fileUrl ?? existing.fileKey,
        mimeType: dto.mimeType ?? existing.mimeType,
        sizeBytes: dto.sizeBytes ?? existing.sizeBytes,
        resourceKind:
          dto.resourceKind ??
          (dto.resourceType ? this.mapResourceKind(dto.resourceType) : existing.resourceKind),
        externalUrl: dto.externalUrl ?? existing.externalUrl,
      },
    });

    return {
      data: {
        id: resource.id,
        title: resource.fileName,
        description: resource.label,
        resourceType: resource.resourceKind,
        status: 'PUBLISHED',
        source: 'api',
        updatedAt: resource.createdAt.toISOString(),
        url: resource.externalUrl ?? this.storageService.getUrl(resource.fileKey),
      },
    };
  }

  async deleteResource(id: string) {
    try {
      await this.prisma.attachment.delete({ where: { id } });
    } catch (error) {
      this.rethrowDeleteError(
        error,
        'Cannot delete resource while it is linked to other content',
      );
    }
    return { success: true };
  }

  // ─── Speakers ────────────────────────────────────────────────────────────

  private toAdminSpeaker(
    speaker: Prisma.SpeakerGetPayload<{
      include: {
        competency: true;
        _count: { select: { videos: true; knowledgeMeets: true } };
      };
    }>,
  ) {
    return {
      id: speaker.id,
      slug: speaker.slug ?? slugify(speaker.name),
      name: speaker.name,
      designation: speaker.designation,
      bio: speaker.bio,
      linkedinUrl: speaker.linkedinUrl,
      avatarUrl: speaker.avatarUrl,
      competencyId: speaker.competencyId,
      competency: speaker.competency
        ? {
            id: speaker.competency.id,
            name: speaker.competency.name,
            slug: speaker.competency.slug,
          }
        : null,
      sessionCount: speaker._count.videos + speaker._count.knowledgeMeets,
      source: 'api' as const,
      updatedAt: speaker.updatedAt.toISOString(),
    };
  }

  async listSpeakers() {
    const items = await this.prisma.speaker.findMany({
      orderBy: { name: 'asc' },
      include: {
        competency: true,
        _count: { select: { videos: true, knowledgeMeets: true } },
      },
    });
    return { data: items.map((s) => this.toAdminSpeaker(s)) };
  }

  async getSpeaker(id: string) {
    const speaker = await this.prisma.speaker.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        competency: true,
        _count: { select: { videos: true, knowledgeMeets: true } },
      },
    });
    if (!speaker) throw new NotFoundException('Speaker not found');
    return { data: this.toAdminSpeaker(speaker) };
  }

  async createSpeaker(dto: CreateSpeakerDto) {
    const speaker = await this.prisma.speaker.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        designation: dto.designation,
        competencyId: dto.competencyId,
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
        linkedinUrl: dto.linkedinUrl,
      },
      include: {
        competency: true,
        _count: { select: { videos: true, knowledgeMeets: true } },
      },
    });
    return { data: this.toAdminSpeaker(speaker) };
  }

  async updateSpeaker(id: string, dto: UpdateSpeakerDto) {
    const existing = await this.prisma.speaker.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!existing) throw new NotFoundException('Speaker not found');

    const speaker = await this.prisma.speaker.update({
      where: { id: existing.id },
      data: {
        name: dto.name ?? existing.name,
        slug: dto.slug ?? existing.slug ?? slugify(dto.name ?? existing.name),
        designation: dto.designation ?? existing.designation,
        competencyId:
          dto.competencyId !== undefined ? dto.competencyId : existing.competencyId,
        avatarUrl: dto.avatarUrl ?? existing.avatarUrl,
        bio: dto.bio ?? existing.bio,
        linkedinUrl: dto.linkedinUrl ?? existing.linkedinUrl,
      },
      include: {
        competency: true,
        _count: { select: { videos: true, knowledgeMeets: true } },
      },
    });

    return { data: this.toAdminSpeaker(speaker) };
  }

  async deleteSpeaker(id: string) {
    const speaker = await this.prisma.speaker.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!speaker) throw new NotFoundException('Speaker not found');

    try {
      await this.prisma.speaker.delete({ where: { id: speaker.id } });
    } catch (error) {
      this.rethrowDeleteError(
        error,
        'Cannot delete speaker while they are linked to sessions or videos',
      );
    }

    return { success: true };
  }

  // ─── Competencies ────────────────────────────────────────────────────────

  private async competencyCounts(competencyId: string) {
    const [sessions, series, resources] = await Promise.all([
      this.prisma.knowledgeMeet.count({ where: { competencyId, deletedAt: null } }),
      this.prisma.knowledgeSeries.count({ where: { competencyId, deletedAt: null } }),
      this.prisma.attachment.count({
        where: { videoId: null, meetId: null },
      }),
    ]);
    return { sessionCount: sessions, seriesCount: series, resourceCount: resources };
  }

  async listCompetencies() {
    const items = await this.prisma.competency.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const data = await Promise.all(
      items.map(async (c) => {
        const counts = await this.competencyCounts(c.id);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          ...counts,
          source: 'api' as const,
          updatedAt: c.createdAt.toISOString(),
        };
      }),
    );

    return { data };
  }

  async createCompetency(dto: CreateCompetencyDto) {
    const competency = await this.prisma.competency.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        description: dto.description,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      data: {
        ...competency,
        sessionCount: 0,
        seriesCount: 0,
        resourceCount: 0,
        source: 'api',
        updatedAt: competency.createdAt.toISOString(),
      },
    };
  }

  async updateCompetency(id: string, dto: UpdateCompetencyDto) {
    const existing = await this.prisma.competency.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Competency not found');

    const competency = await this.prisma.competency.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        slug: dto.slug ?? existing.slug,
        description: dto.description ?? existing.description,
        icon: dto.icon ?? existing.icon,
        sortOrder: dto.sortOrder ?? existing.sortOrder,
      },
    });

    const counts = await this.competencyCounts(id);
    return {
      data: {
        ...competency,
        ...counts,
        source: 'api',
        updatedAt: competency.createdAt.toISOString(),
      },
    };
  }

  async deleteCompetency(id: string) {
    try {
      await this.prisma.competency.delete({ where: { id } });
    } catch (error) {
      this.rethrowDeleteError(
        error,
        'Cannot delete competency while it is linked to sessions, series, or resources',
      );
    }
    return { success: true };
  }

  private mapHomepageSection(row: {
    sectionType: string;
    title: string | null;
    isActive: boolean;
    sortOrder: number;
  }): HomepageSectionDto {
    return {
      id: row.sectionType,
      title: row.title ?? row.sectionType,
      visible: row.isActive,
      order: row.sortOrder,
    };
  }

  private async ensureHomepageSections(): Promise<HomepageSectionDto[]> {
    const count = await this.prisma.homepageSection.count();
    if (count === 0) {
      await this.prisma.homepageSection.createMany({
        data: DEFAULT_HOMEPAGE_SECTIONS.map((section) => ({
          sectionType: section.id,
          title: section.title,
          config: {},
          sortOrder: section.order,
          isActive: section.visible,
        })),
      });
    }

    const rows = await this.prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) => this.mapHomepageSection(row));
  }

  async getHomepageLayout() {
    const sections = await this.ensureHomepageSections();
    return { data: sections };
  }

  async updateHomepageLayout(dto: UpdateHomepageLayoutDto) {
    await this.prisma.$transaction(
      dto.sections.map((section) =>
        this.prisma.homepageSection.upsert({
          where: { sectionType: section.id },
          create: {
            sectionType: section.id,
            title: section.title,
            config: {},
            sortOrder: section.order,
            isActive: section.visible,
          },
          update: {
            title: section.title,
            sortOrder: section.order,
            isActive: section.visible,
          },
        }),
      ),
    );

    return this.getHomepageLayout();
  }

  private parsePlatformSettings(data: unknown): PlatformSettingsDto {
    if (!data || typeof data !== 'object') {
      return { ...DEFAULT_PLATFORM_SETTINGS };
    }

    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...(data as Partial<PlatformSettingsDto>),
    };
  }

  private async ensurePlatformSettings(): Promise<PlatformSettingsDto> {
    const row = await this.prisma.platformSetting.findUnique({
      where: { id: 'default' },
    });

    if (!row) {
      await this.prisma.platformSetting.create({
        data: {
          id: 'default',
          data: DEFAULT_PLATFORM_SETTINGS as unknown as Prisma.InputJsonValue,
        },
      });
      return { ...DEFAULT_PLATFORM_SETTINGS };
    }

    return this.parsePlatformSettings(row.data);
  }

  async getPlatformSettings() {
    const settings = await this.ensurePlatformSettings();
    return { data: settings };
  }

  async updatePlatformSettings(dto: UpdatePlatformSettingsDto) {
    const current = await this.ensurePlatformSettings();
    const next = { ...current, ...dto };

    await this.prisma.platformSetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        data: next as unknown as Prisma.InputJsonValue,
      },
      update: {
        data: next as unknown as Prisma.InputJsonValue,
      },
    });

    return { data: next };
  }
}
