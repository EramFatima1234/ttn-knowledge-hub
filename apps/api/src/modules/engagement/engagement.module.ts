import { Module } from '@nestjs/common';
import { EngagementController } from './engagement.controller';
import { EngagementRepository } from './engagement.repository';

@Module({
  controllers: [EngagementController],
  providers: [EngagementRepository],
  exports: [EngagementRepository],
})
export class EngagementModule {}
