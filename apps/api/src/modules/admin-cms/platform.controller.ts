import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminCmsService } from './admin-cms.service';

@ApiTags('Platform')
@ApiBearerAuth()
@Controller()
export class PlatformController {
  constructor(private readonly adminCmsService: AdminCmsService) {}

  @Get('homepage/layout')
  @ApiOperation({ summary: 'Get learner homepage layout' })
  getHomepageLayout() {
    return this.adminCmsService.getHomepageLayout();
  }

  @Get('platform/settings')
  @ApiOperation({ summary: 'Get platform settings (read-only)' })
  getPlatformSettings() {
    return this.adminCmsService.getPlatformSettings();
  }
}
