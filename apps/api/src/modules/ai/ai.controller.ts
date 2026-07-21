import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { AiDiscoverDto } from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @ApiOperation({ summary: 'AI provider status' })
  status() {
    return { data: this.aiService.status() };
  }

  @Post('discover')
  @ApiOperation({ summary: 'KnowledgeHub AI — discover learning content' })
  discover(
    @Body() dto: AiDiscoverDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.discover(dto.prompt, user.id).then((data) => ({ data }));
  }

  @Post('discover/stream')
  @ApiOperation({ summary: 'KnowledgeHub AI — streaming discover answer' })
  async discoverStream(
    @Body() dto: AiDiscoverDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    try {
      for await (const event of this.aiService.discoverStream(dto.prompt, user.id)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (error) {
      const message = (error as Error).message || 'AI stream failed';
      this.logger.warn(`discover/stream error: ${message}`);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message,
        })}\n\n`,
      );
    }

    res.end();
  }

  @Post('videos/:videoId/summary')
  @ApiOperation({ summary: 'AI summary for a video' })
  summarizeVideo(
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.summarizeVideo(videoId, user.id).then((data) => ({ data }));
  }

  @Post('videos/:videoId/quiz')
  @ApiOperation({ summary: 'AI quiz for a video' })
  quizVideo(
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.quizForVideo(videoId, user.id).then((data) => ({ data }));
  }
}
