import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdminCmsService } from './admin-cms.service';
import { UploadEpisodeSlotDto } from './dto/team-series.dto';

@ApiTags('Team Series')
@ApiBearerAuth()
@Roles(RoleName.ADMIN, RoleName.TEAM)
@Controller('team/series')
export class TeamSeriesController {
  constructor(private readonly adminCmsService: AdminCmsService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge series open for episode uploads' })
  listSeries() {
    return this.adminCmsService.listSeriesForContributors();
  }

  @Get(':seriesId/episodes')
  @ApiOperation({ summary: 'List episode slots for a knowledge series' })
  listEpisodes(@Param('seriesId') seriesId: string) {
    return this.adminCmsService.listEpisodes(seriesId);
  }

  @Put(':seriesId/episodes/:orderIndex')
  @ApiOperation({ summary: 'Upload or replace a video for a specific episode slot' })
  uploadToSlot(
    @Param('seriesId') seriesId: string,
    @Param('orderIndex', ParseIntPipe) orderIndex: number,
    @Body() dto: UploadEpisodeSlotDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminCmsService.upsertEpisodeAtSlot(seriesId, orderIndex, {
      ...dto,
      cmsStatus: 'PENDING',
    }, user.id);
  }
}
