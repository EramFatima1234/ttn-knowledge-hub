import { Injectable } from '@nestjs/common';
import { ContentType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../common/dto/pagination.dto';
import { SearchQueryDto, SearchSort } from './dto/search-query.dto';

interface RawSearchRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  subtitle: string | null;
  published_at: Date | null;
  scheduled_at: Date | null;
  view_count: number | null;
  competency_id: string | null;
  competency_name: string | null;
  competency_slug: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  rank: number;
}

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const types = dto.types?.length
      ? dto.types
      : [ContentType.VIDEO, ContentType.KNOWLEDGE_MEET, ContentType.KNOWLEDGE_SERIES];

    const parts: Prisma.Sql[] = [];

    if (types.includes(ContentType.VIDEO)) {
      parts.push(this.videoSearchSql(dto));
    }
    if (types.includes(ContentType.KNOWLEDGE_MEET)) {
      parts.push(this.meetSearchSql(dto));
    }
    if (types.includes(ContentType.KNOWLEDGE_SERIES)) {
      parts.push(this.seriesSearchSql(dto));
    }

    if (!parts.length) {
      return { items: [], total: 0, page, limit };
    }

    const unionSql = Prisma.join(parts, ' UNION ALL ');
    const orderClause = this.orderClause(dto.sort ?? SearchSort.RELEVANCE);
    const offset = (page - 1) * limit;

    const countResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM (${unionSql}) AS results
    `;
    const total = Number(countResult[0]?.count ?? 0);

    const rows = await this.prisma.$queryRaw<RawSearchRow[]>`
      SELECT * FROM (${unionSql}) AS results
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      items: rows.map((row) => this.toItem(row)),
      total,
      page,
      limit,
    };
  }

  async suggestions(q: string, limit: number) {
    const rows = await this.prisma.$queryRaw<
      { id: string; type: string; title: string; rank: number }[]
    >`
      SELECT id, type, title, rank FROM (
        SELECT v.id::text, 'VIDEO'::text AS type, v.title,
          ts_rank(v.search_vector, plainto_tsquery('english', ${q})) AS rank
        FROM videos v
        WHERE v.deleted_at IS NULL AND v.status = 'PUBLISHED'
          AND v.search_vector @@ plainto_tsquery('english', ${q})
        UNION ALL
        SELECT m.id::text, 'KNOWLEDGE_MEET'::text, m.title,
          ts_rank(m.search_vector, plainto_tsquery('english', ${q}))
        FROM knowledge_meets m
        WHERE m.deleted_at IS NULL
          AND m.search_vector @@ plainto_tsquery('english', ${q})
        UNION ALL
        SELECT s.id::text, 'KNOWLEDGE_SERIES'::text, s.title,
          ts_rank(s.search_vector, plainto_tsquery('english', ${q}))
        FROM knowledge_series s
        WHERE s.deleted_at IS NULL AND s.status = 'PUBLISHED'
          AND s.search_vector @@ plainto_tsquery('english', ${q})
      ) AS suggestions
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    return rows;
  }

  private videoSearchSql(dto: SearchQueryDto): Prisma.Sql {
    const competencyFilter = dto.competencyId
      ? Prisma.sql`AND v.competency_id = ${dto.competencyId}`
      : Prisma.empty;
    const categoryFilter = dto.categoryId
      ? Prisma.sql`AND v.category_id = ${dto.categoryId}`
      : Prisma.empty;
    const speakerFilter = dto.speakerId
      ? Prisma.sql`AND v.speaker_id = ${dto.speakerId}`
      : Prisma.empty;
    const seriesFilter = dto.seriesId
      ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM series_sessions ss
          WHERE ss.video_id = v.id AND ss.series_id = ${dto.seriesId}
        )`
      : Prisma.empty;
    const minDurationFilter = dto.minDuration != null
      ? Prisma.sql`AND v.duration_seconds >= ${dto.minDuration}`
      : Prisma.empty;
    const maxDurationFilter = dto.maxDuration != null
      ? Prisma.sql`AND v.duration_seconds <= ${dto.maxDuration}`
      : Prisma.empty;

    return Prisma.sql`
      SELECT
        v.id::text,
        'VIDEO'::text AS type,
        v.title,
        v.description,
        v.thumbnail_url,
        NULL::text AS subtitle,
        v.published_at,
        NULL::timestamptz AS scheduled_at,
        v.view_count,
        c.id::text AS competency_id,
        c.name AS competency_name,
        c.slug AS competency_slug,
        cat.id::text AS category_id,
        cat.name AS category_name,
        cat.slug AS category_slug,
        ts_rank(v.search_vector, plainto_tsquery('english', ${dto.q})) AS rank
      FROM videos v
      LEFT JOIN competencies c ON c.id = v.competency_id
      LEFT JOIN categories cat ON cat.id = v.category_id
      WHERE v.deleted_at IS NULL
        AND v.status = 'PUBLISHED'
        AND v.search_vector @@ plainto_tsquery('english', ${dto.q})
        ${competencyFilter}
        ${categoryFilter}
        ${speakerFilter}
        ${seriesFilter}
        ${minDurationFilter}
        ${maxDurationFilter}
    `;
  }

  private meetSearchSql(dto: SearchQueryDto): Prisma.Sql {
    const competencyFilter = dto.competencyId
      ? Prisma.sql`AND m.competency_id = ${dto.competencyId}`
      : Prisma.empty;
    const categoryFilter = dto.categoryId
      ? Prisma.sql`AND m.category_id = ${dto.categoryId}`
      : Prisma.empty;

    return Prisma.sql`
      SELECT
        m.id::text,
        'KNOWLEDGE_MEET'::text AS type,
        m.title,
        m.description,
        m.thumbnail_url,
        m.subtitle,
        NULL::timestamptz AS published_at,
        m.scheduled_at,
        NULL::int AS view_count,
        c.id::text AS competency_id,
        c.name AS competency_name,
        c.slug AS competency_slug,
        cat.id::text AS category_id,
        cat.name AS category_name,
        cat.slug AS category_slug,
        ts_rank(m.search_vector, plainto_tsquery('english', ${dto.q})) AS rank
      FROM knowledge_meets m
      LEFT JOIN competencies c ON c.id = m.competency_id
      LEFT JOIN categories cat ON cat.id = m.category_id
      WHERE m.deleted_at IS NULL
        AND m.search_vector @@ plainto_tsquery('english', ${dto.q})
        ${competencyFilter}
        ${categoryFilter}
    `;
  }

  private seriesSearchSql(dto: SearchQueryDto): Prisma.Sql {
    const competencyFilter = dto.competencyId
      ? Prisma.sql`AND s.competency_id = ${dto.competencyId}`
      : Prisma.empty;

    return Prisma.sql`
      SELECT
        s.id::text,
        'KNOWLEDGE_SERIES'::text AS type,
        s.title,
        s.description,
        s.thumbnail_url,
        NULL::text AS subtitle,
        s.created_at AS published_at,
        NULL::timestamptz AS scheduled_at,
        NULL::int AS view_count,
        c.id::text AS competency_id,
        c.name AS competency_name,
        c.slug AS competency_slug,
        NULL::text AS category_id,
        NULL::text AS category_name,
        NULL::text AS category_slug,
        ts_rank(s.search_vector, plainto_tsquery('english', ${dto.q})) AS rank
      FROM knowledge_series s
      LEFT JOIN competencies c ON c.id = s.competency_id
      WHERE s.deleted_at IS NULL
        AND s.status = 'PUBLISHED'
        AND s.search_vector @@ plainto_tsquery('english', ${dto.q})
        ${competencyFilter}
    `;
  }

  private orderClause(sort: SearchSort): Prisma.Sql {
    switch (sort) {
      case SearchSort.NEWEST:
        return Prisma.sql`ORDER BY published_at DESC NULLS LAST, scheduled_at DESC NULLS LAST`;
      case SearchSort.POPULAR:
        return Prisma.sql`ORDER BY view_count DESC NULLS LAST, rank DESC`;
      default:
        return Prisma.sql`ORDER BY rank DESC`;
    }
  }

  private toItem(row: RawSearchRow) {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      thumbnailUrl: row.thumbnail_url,
      subtitle: row.subtitle,
      publishedAt: row.published_at?.toISOString() ?? null,
      scheduledAt: row.scheduled_at?.toISOString() ?? null,
      viewCount: row.view_count ?? undefined,
      rank: row.rank,
      competency: row.competency_id
        ? {
            id: row.competency_id,
            name: row.competency_name!,
            slug: row.competency_slug!,
          }
        : null,
      category: row.category_id
        ? {
            id: row.category_id,
            name: row.category_name!,
            slug: row.category_slug!,
          }
        : null,
    };
  }

  toResponse(result: Awaited<ReturnType<SearchRepository['search']>>) {
    return {
      data: {
        items: result.items,
        meta: buildMeta(result.page, result.limit, result.total),
      },
    };
  }
}
