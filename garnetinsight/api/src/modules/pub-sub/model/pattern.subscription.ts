import { AbstractSubscription } from 'src/modules/pub-sub/model/abstract.subscription';
import { RedisClient } from 'src/modules/redis/client';

export class PatternSubscription extends AbstractSubscription {
  async subscribe(client: RedisClient): Promise<void> {
    await client.pSubscribe(this.channel);
  }

  async unsubscribe(client: RedisClient): Promise<void> {
    await client.pUnsubscribe(this.channel);
  }
}
