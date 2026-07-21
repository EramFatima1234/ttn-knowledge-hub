import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/auth.decorators';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      data: {
        status: 'ok',
        service: 'knowledgehub-api',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
