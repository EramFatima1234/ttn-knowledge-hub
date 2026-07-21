import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { QaService } from './qa.service';

class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;
}

class CreateAnswerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;
}

class VoteDto {
  @ApiProperty({ enum: [1, -1] })
  @Type(() => Number)
  @IsIn([1, -1])
  value!: 1 | -1;
}

@ApiTags('Q&A')
@ApiBearerAuth()
@Controller()
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Get('videos/:videoId/questions')
  @ApiOperation({ summary: 'List Q&A for a video' })
  list(
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.qaService.listQuestions(videoId, user.id);
  }

  @Post('videos/:videoId/questions')
  @ApiOperation({ summary: 'Ask a question' })
  createQuestion(
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.qaService.createQuestion(videoId, user.id, dto.body);
  }

  @Post('questions/:questionId/answers')
  @ApiOperation({ summary: 'Answer a question' })
  createAnswer(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.qaService.createAnswer(questionId, user.id, dto.body);
  }

  @Post('questions/:questionId/vote')
  @ApiOperation({ summary: 'Vote on a question' })
  voteQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VoteDto,
  ) {
    return this.qaService.voteQuestion(questionId, user.id, dto.value);
  }

  @Post('answers/:answerId/vote')
  @ApiOperation({ summary: 'Vote on an answer' })
  voteAnswer(
    @Param('answerId') answerId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VoteDto,
  ) {
    return this.qaService.voteAnswer(answerId, user.id, dto.value);
  }

  @Post('answers/:answerId/accept')
  @ApiOperation({ summary: 'Accept an answer' })
  acceptAnswer(
    @Param('answerId') answerId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.qaService.acceptAnswer(answerId, user.id);
  }
}
