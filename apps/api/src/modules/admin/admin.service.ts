import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [users, videos, meets, series, pending] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.video.count({ where: { deletedAt: null } }),
      this.prisma.knowledgeMeet.count({ where: { deletedAt: null } }),
      this.prisma.knowledgeSeries.count({ where: { deletedAt: null } }),
      this.prisma.video.count({
        where: { status: 'PENDING_APPROVAL', deletedAt: null },
      }),
    ]);

    return {
      data: { users, videos, knowledgeMeets: meets, knowledgeSeries: series, pendingApprovals: pending },
    };
  }

  async listAnnouncements() {
    const data = await this.prisma.announcement.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
    return { data };
  }

  async listActiveAnnouncements() {
    const data = await this.prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });
    return { data };
  }

  async createAnnouncement(dto: CreateAnnouncementDto) {
    const data = await this.prisma.announcement.create({ data: dto });
    return { data };
  }

  async updateAnnouncement(id: string, dto: UpdateAnnouncementDto) {
    const data = await this.prisma.announcement.update({
      where: { id },
      data: dto,
    });
    return { data };
  }

  async deleteAnnouncement(id: string) {
    await this.prisma.announcement.delete({ where: { id } });
    return { data: { success: true } };
  }

  async recentFeedback(limit = 10) {
    const rows = await this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true } },
        video: { select: { title: true } },
        meet: { select: { title: true } },
      },
    });

    return {
      data: rows.map((row) => ({
        id: row.id,
        sessionTitle: row.video?.title ?? row.meet?.title ?? 'Session',
        rating: row.rating ?? 0,
        comment: row.comment ?? '',
        createdAt: row.createdAt.toISOString(),
        authorName: row.user.name,
      })),
    };
  }
}
