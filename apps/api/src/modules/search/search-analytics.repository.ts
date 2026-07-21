import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchAnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  logQuery(userId: string | undefined, query: string, resultCount = 0) {
    return this.prisma.searchQueryLog.create({
      data: { userId, query: query.trim().toLowerCase(), resultCount },
    });
  }

  async recentForUser(userId: string, limit = 8) {
    const rows = await this.prisma.searchQueryLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit * 3,
    });
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const row of rows) {
      if (seen.has(row.query)) continue;
      seen.add(row.query);
      unique.push(row.query);
      if (unique.length >= limit) break;
    }
    return unique;
  }

  async popular(limit = 8) {
    const rows = await this.prisma.$queryRaw<{ query: string; count: bigint }[]>`
      SELECT query, COUNT(*)::bigint AS count
      FROM search_query_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({ query: r.query, count: Number(r.count) }));
  }

  async trending(limit = 8) {
    const rows = await this.prisma.$queryRaw<{ query: string; count: bigint }[]>`
      SELECT query, COUNT(*)::bigint AS count
      FROM search_query_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({ query: r.query, count: Number(r.count) }));
  }

  async noResults(limit = 8) {
    const rows = await this.prisma.$queryRaw<{ query: string; count: bigint }[]>`
      SELECT query, COUNT(*)::bigint AS count
      FROM search_query_logs
      WHERE result_count = 0
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({
      query: r.query,
      count: Number(r.count),
      hasResults: false,
      suggestion: `Consider adding content about "${r.query}"`,
    }));
  }
}
