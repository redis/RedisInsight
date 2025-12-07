import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';
import { RedisClient } from 'src/modules/redis/client';

export interface ISubscription {
  getId(): string;

  getChannel(): string;

  getType(): string;

  pushMessage(message: IMessage): void;

  subscribe(client: RedisClient): Promise<void>;

  unsubscribe(client: RedisClient): Promise<void>;
}
