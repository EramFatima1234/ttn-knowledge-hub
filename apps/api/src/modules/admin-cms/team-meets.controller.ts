import {
  Body,
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdminCmsService } from './admin-cms.service';
import { UploadMeetRecordingDto } from './dto/team-meet.dto';

@ApiTags('Team Meets')
@ApiBearerAuth()
@Roles(RoleName.ADMIN, RoleName.TEAM)
@Controller('team/meets')
export class TeamMeetsController {
  constructor(private readonly adminCmsService: AdminCmsService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge meets open for recording uploads' })
  listMeets() {
    return this.adminCmsService.listMeetsForContributors();
  }

  @Put(':meetId/recording')
  @ApiOperation({ summary: 'Upload session recording for a knowledge meet' })
  uploadRecording(
    @Param('meetId') meetId: string,
    @Body() dto: UploadMeetRecordingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminCmsService.upsertMeetRecording(
      meetId,
      { ...dto, cmsStatus: dto.cmsStatus ?? 'PENDING' },
      user.id,
    );
  }
}
