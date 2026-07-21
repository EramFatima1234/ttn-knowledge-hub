import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

class UpdatePlaybackPreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.25)
  @Max(3)
  playbackSpeed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoPlayNext?: boolean;
}

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Learning progress summary' })
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getSummary(user.id);
  }

  @Get('weekly-activity')
  @ApiOperation({ summary: 'Weekly watch activity' })
  weeklyActivity(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getWeeklyActivity(user.id);
  }

  @Get('playback-preferences')
  @ApiOperation({ summary: 'User playback preferences' })
  playbackPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getPlaybackPreferences(user.id);
  }

  @Put('playback-preferences')
  @ApiOperation({ summary: 'Update playback preferences' })
  updatePlaybackPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePlaybackPreferenceDto,
  ) {
    return this.progressService.updatePlaybackPreferences(user.id, dto);
  }
}
