import { AbstractSubscription } from 'src/modules/pub-sub/model/abstract.subscription';
import { RedisClient } from 'src/modules/redis/client';

export class SimpleSubscription extends AbstractSubscription {
  async subscribe(client: RedisClient): Promise<void> {
    await client.subscribe(this.channel);
  }

  async unsubscribe(client: RedisClient): Promise<void> {
    await client.unsubscribe(this.channel);
  }
}
