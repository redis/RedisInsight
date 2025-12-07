import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionDto } from 'src/modules/pub-sub/dto';
import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { PatternSubscription } from 'src/modules/pub-sub/model/pattern.subscription';
import { SimpleSubscription } from 'src/modules/pub-sub/model/simple.subscription';
import { ISubscription } from 'src/modules/pub-sub/interfaces/subscription.interface';

@Injectable()
export class SubscriptionProvider {
  createSubscription(
    userClient: UserClient,
    dto: SubscriptionDto,
  ): ISubscription {
    switch (dto.type) {
      case SubscriptionType.PSubscribe:
        return new PatternSubscription(userClient, dto);
      case SubscriptionType.Subscribe:
        return new SimpleSubscription(userClient, dto);
      case SubscriptionType.SSubscribe:
      default:
        throw new BadRequestException('Unsupported Subscription type');
    }
  }
}
