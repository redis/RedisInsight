import { Module } from '@nestjs/common';
import { SlowLogController } from 'src/modules/slow-log/slow-log.controller';
import { SlowLogService } from 'src/modules/slow-log/slow-log.service';
import { SlowLogAnalytics } from 'src/modules/slow-log/slow-log.analytics';

@Module({
  providers: [SlowLogService, SlowLogAnalytics],
  controllers: [SlowLogController],
})
export class SlowLogModule {}
