import { Injectable } from '@nestjs/common';
import { buildMeta } from '../../common/dto/pagination.dto';
import { SeriesRepository } from './series.repository';

@Injectable()
export class SeriesService {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async list(params: { page: number; limit: number }, userId?: string) {
    const result = await this.seriesRepository.findMany(params);
    const data = await Promise.all(
      result.items.map(async (series) => {
        const progressPercent = userId
          ? await this.seriesRepository.calcSeriesProgress(series.id, userId)
          : 0;
        return this.seriesRepository.toSummary(series, progressPercent);
      }),
    );

    return {
      data,
      meta: buildMeta(result.page, result.limit, result.total),
    };
  }

  async getById(id: string, userId: string) {
    const data = await this.seriesRepository.getDetailForUser(id, userId);
    return { data };
  }
}
