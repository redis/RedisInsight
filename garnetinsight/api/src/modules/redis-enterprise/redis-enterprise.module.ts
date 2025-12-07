import { Module } from '@nestjs/common';
import { RedisEnterpriseService } from 'src/modules/redis-enterprise/redis-enterprise.service';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';
import { RedisEnterpriseController } from 'src/modules/redis-enterprise/redis-enterprise.controller';

@Module({
  controllers: [RedisEnterpriseController],
  providers: [RedisEnterpriseService, RedisEnterpriseAnalytics],
})
export class RedisEnterpriseModule {}
