import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SpeakersService } from './speakers.service';

@ApiTags('Speakers')
@ApiBearerAuth()
@Controller('speakers')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Get()
  @ApiOperation({ summary: 'List speakers' })
  list() {
    return this.speakersService.list();
  }

  @Get(':slugOrId')
  @ApiOperation({ summary: 'Speaker profile' })
  profile(
    @Param('slugOrId') slugOrId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.speakersService.getProfile(slugOrId, user.id);
  }
}
