import { Module } from '@nestjs/common';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { ProfilerController } from 'src/modules/profiler/profiler.controller';
import { RedisObserverProvider } from 'src/modules/profiler/providers/redis-observer.provider';
import { ProfilerClientProvider } from 'src/modules/profiler/providers/profiler-client.provider';
import { ProfilerAnalyticsService } from 'src/modules/profiler/profiler-analytics.service';
import { ProfilerGateway } from './profiler.gateway';
import { ProfilerService } from './profiler.service';

@Module({
  providers: [
    ProfilerAnalyticsService,
    RedisObserverProvider,
    ProfilerClientProvider,
    LogFileProvider,
    ProfilerGateway,
    ProfilerService,
  ],
  controllers: [ProfilerController],
  exports: [LogFileProvider],
})
export class ProfilerModule {}
