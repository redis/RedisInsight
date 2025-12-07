import { Module } from '@nestjs/common';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
