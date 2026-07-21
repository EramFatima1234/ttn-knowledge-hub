import { Injectable } from '@nestjs/common';
import { MeetStatus } from '@prisma/client';
import { buildMeta } from '../../common/dto/pagination.dto';
import { MeetsRepository, MeetLibrarySort } from './meets.repository';

@Injectable()
export class MeetsService {
  constructor(private readonly meetsRepository: MeetsRepository) {}

  async list(params: {
    page: number;
    limit: number;
    status?: MeetStatus;
    competencyId?: string;
    speakerId?: string;
    year?: number;
    search?: string;
    sort?: MeetLibrarySort;
    difficulty?: string;
    tag?: string;
  }) {
    const result = await this.meetsRepository.findMany(params);
    return {
      data: result.items.map((m) => this.meetsRepository.toSummary(m)),
      meta: buildMeta(result.page, result.limit, result.total),
    };
  }

  async getById(id: string, userId: string) {
    const data = await this.meetsRepository.getDetailForUser(id, userId);
    return { data };
  }
}
