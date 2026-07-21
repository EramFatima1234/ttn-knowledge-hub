import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ListMeetsQueryDto } from './dto/list-meets-query.dto';
import { MeetsService } from './meets.service';

@ApiTags('Knowledge Meets')
@ApiBearerAuth()
@Controller('knowledge-meets')
export class MeetsController {
  constructor(private readonly meetsService: MeetsService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge meets' })
  list(@Query() query: ListMeetsQueryDto) {
    return this.meetsService.list({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
      competencyId: query.competencyId,
      speakerId: query.speakerId,
      year: query.year,
      search: query.search,
      sort: query.sort,
      difficulty: query.difficulty,
      tag: query.tag,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge meet detail' })
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.meetsService.getById(id, user.id);
  }
}
