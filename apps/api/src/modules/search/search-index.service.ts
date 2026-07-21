import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentStatus, MeetStatus, Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchSearchAdapter } from './adapters/elasticsearch-search.adapter';
import { SearchIndexDocument } from './search.port';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly elasticsearchAdapter: ElasticsearchSearchAdapter,
  ) {}

  isElasticsearchEnabled() {
    return (
      (this.configService.get<string>('search.provider') ?? 'postgres') ===
      'elasticsearch'
    );
  }

  async ensureIndex() {
    if (!this.isElasticsearchEnabled() || !this.elasticsearchAdapter.isAvailable()) {
      return false;
    }

    const client = this.elasticsearchAdapter.getClient();
    const indexName = this.elasticsearchAdapter.getIndexName();
    if (!client) return false;

    const exists = await client.indices.exists({ index: indexName });
    if (!exists) {
      await client.indices.create({
        index: indexName,
        mappings: {
          properties: {
            id: { type: 'keyword' },
            type: { type: 'keyword' },
            title: { type: 'text' },
            description: { type: 'text' },
            subtitle: { type: 'text' },
            competencyId: { type: 'keyword' },
            categoryId: { type: 'keyword' },
            competencyName: { type: 'keyword' },
            competencySlug: { type: 'keyword' },
            categoryName: { type: 'keyword' },
            categorySlug: { type: 'keyword' },
            thumbnailUrl: { type: 'keyword', index: false },
            publishedAt: { type: 'date' },
            scheduledAt: { type: 'date' },
            viewCount: { type: 'integer' },
          },
        },
      });
      this.logger.log(`Created Elasticsearch index: ${indexName}`);
    }

    return true;
  }

  async indexDocument(doc: SearchIndexDocument) {
    if (!this.isElasticsearchEnabled()) return;
    if (!(await this.ensureIndex())) return;

    const client = this.elasticsearchAdapter.getClient();
    const indexName = this.elasticsearchAdapter.getIndexName();
    if (!client) return;

    await client.index({
      index: indexName,
      id: `${doc.type}:${doc.id}`,
      document: doc,
      refresh: true,
    });
  }

  async removeDocument(type: string, id: string) {
    if (!this.isElasticsearchEnabled() || !this.elasticsearchAdapter.isAvailable()) {
      return;
    }

    const client = this.elasticsearchAdapter.getClient();
    const indexName = this.elasticsearchAdapter.getIndexName();
    if (!client) return;

    try {
      await client.delete({
        index: indexName,
        id: `${type}:${id}`,
        refresh: true,
      });
    } catch {
      // Document may not exist in the index yet.
    }
  }

  async reindexAll() {
    if (!this.isElasticsearchEnabled()) {
      return { indexed: 0, provider: 'postgres' };
    }

    await this.ensureIndex();

    const [videos, meets, series] = await Promise.all([
      this.prisma.video.findMany({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
        include: { competency: true, category: true },
      }),
      this.prisma.knowledgeMeet.findMany({
        where: {
          deletedAt: null,
          status: MeetStatus.COMPLETED,
          visibility: Visibility.INTERNAL,
          recording: { is: { status: ContentStatus.PUBLISHED, deletedAt: null } },
        },
        include: { competency: true, category: true },
      }),
      this.prisma.knowledgeSeries.findMany({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
        include: { competency: true },
      }),
    ]);

    let indexed = 0;

    for (const video of videos) {
      await this.indexDocument(this.videoDoc(video));
      indexed++;
    }
    for (const meet of meets) {
      await this.indexDocument(this.meetDoc(meet));
      indexed++;
    }
    for (const item of series) {
      await this.indexDocument(this.seriesDoc(item));
      indexed++;
    }

    return { indexed, provider: 'elasticsearch' };
  }

  async syncVideo(id: string) {
    const video = await this.prisma.video.findFirst({
      where: { id, deletedAt: null },
      include: { competency: true, category: true },
    });
    if (!video) return;

    if (video.status === ContentStatus.PUBLISHED) {
      await this.indexDocument(this.videoDoc(video));
    } else {
      await this.removeDocument('VIDEO', id);
    }
  }

  async syncMeet(id: string) {
    const meet = await this.prisma.knowledgeMeet.findFirst({
      where: { id, deletedAt: null },
      include: { competency: true, category: true, recording: true },
    });
    if (!meet) return;

    const isPublishedLibrary =
      meet.status === MeetStatus.COMPLETED
      && meet.visibility === Visibility.INTERNAL
      && meet.recording?.status === ContentStatus.PUBLISHED;

    if (isPublishedLibrary) {
      await this.indexDocument(this.meetDoc(meet));
    } else {
      await this.removeDocument('KNOWLEDGE_MEET', id);
    }
  }

  async syncSeries(id: string) {
    const series = await this.prisma.knowledgeSeries.findFirst({
      where: { id, deletedAt: null },
      include: { competency: true },
    });
    if (!series) return;

    if (series.status === ContentStatus.PUBLISHED) {
      await this.indexDocument(this.seriesDoc(series));
    } else {
      await this.removeDocument('KNOWLEDGE_SERIES', id);
    }
  }

  private videoDoc(
    video: Prisma.VideoGetPayload<{
      include: { competency: true; category: true };
    }>,
  ): SearchIndexDocument {
    return {
      id: video.id,
      type: 'VIDEO',
      title: video.title,
      description: video.description,
      competencyId: video.competencyId,
      categoryId: video.categoryId,
      thumbnailUrl: video.thumbnailUrl,
      publishedAt: video.publishedAt?.toISOString() ?? null,
      viewCount: video.viewCount,
      competencyName: video.competency?.name ?? null,
      competencySlug: video.competency?.slug ?? null,
      categoryName: video.category?.name ?? null,
      categorySlug: video.category?.slug ?? null,
    };
  }

  private meetDoc(
    meet: Prisma.KnowledgeMeetGetPayload<{
      include: { competency: true; category: true };
    }>,
  ): SearchIndexDocument {
    return {
      id: meet.id,
      type: 'KNOWLEDGE_MEET',
      title: meet.title,
      description: meet.description,
      subtitle: meet.subtitle,
      competencyId: meet.competencyId,
      categoryId: meet.categoryId,
      thumbnailUrl: meet.thumbnailUrl,
      scheduledAt: meet.scheduledAt.toISOString(),
      competencyName: meet.competency?.name ?? null,
      competencySlug: meet.competency?.slug ?? null,
      categoryName: meet.category?.name ?? null,
      categorySlug: meet.category?.slug ?? null,
    };
  }

  private seriesDoc(
    series: Prisma.KnowledgeSeriesGetPayload<{ include: { competency: true } }>,
  ): SearchIndexDocument {
    return {
      id: series.id,
      type: 'KNOWLEDGE_SERIES',
      title: series.title,
      description: series.description,
      competencyId: series.competencyId,
      thumbnailUrl: series.thumbnailUrl,
      publishedAt: series.createdAt.toISOString(),
      competencyName: series.competency?.name ?? null,
      competencySlug: series.competency?.slug ?? null,
    };
  }
}
