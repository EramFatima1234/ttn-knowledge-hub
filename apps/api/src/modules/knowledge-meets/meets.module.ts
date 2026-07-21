import { Module } from '@nestjs/common';
import { MeetsController } from './meets.controller';
import { MeetsRepository } from './meets.repository';
import { MeetsService } from './meets.service';

@Module({
  controllers: [MeetsController],
  providers: [MeetsService, MeetsRepository],
  exports: [MeetsRepository, MeetsService],
})
export class KnowledgeMeetsModule {}
