import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SeriesService } from './series.service';

@ApiTags('Knowledge Series')
@ApiBearerAuth()
@Controller('knowledge-series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge series' })
  list(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.seriesService.list(
      {
        page: pagination.page ?? 1,
        limit: pagination.limit ?? 20,
      },
      user.id,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge series detail with sessions' })
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seriesService.getById(id, user.id);
  }
}
