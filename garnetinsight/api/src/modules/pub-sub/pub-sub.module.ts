import { Module } from '@nestjs/common';
import { PubSubGateway } from 'src/modules/pub-sub/pub-sub.gateway';
import { PubSubService } from 'src/modules/pub-sub/pub-sub.service';
import { UserSessionProvider } from 'src/modules/pub-sub/providers/user-session.provider';
import { SubscriptionProvider } from 'src/modules/pub-sub/providers/subscription.provider';
import { RedisClientProvider } from 'src/modules/pub-sub/providers/redis-client.provider';
import { PubSubController } from 'src/modules/pub-sub/pub-sub.controller';
import { PubSubAnalyticsService } from 'src/modules/pub-sub/pub-sub.analytics.service';

@Module({
  providers: [
    PubSubGateway,
    PubSubService,
    PubSubAnalyticsService,
    UserSessionProvider,
    SubscriptionProvider,
    RedisClientProvider,
  ],
  controllers: [PubSubController],
})
export class PubSubModule {}
