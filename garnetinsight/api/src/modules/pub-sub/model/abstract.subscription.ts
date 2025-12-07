import { debounce } from 'lodash';
import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { MessagesResponse, SubscriptionDto } from 'src/modules/pub-sub/dto';
import { ISubscription } from 'src/modules/pub-sub/interfaces/subscription.interface';
import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';
import { RedisClient } from 'src/modules/redis/client';
import { RedisClientSubscriber } from 'src/modules/pub-sub/model/redis-client-subscriber';

const EMIT_WAIT = 30;
const EMIT_MAX_WAIT = 100;
const MESSAGES_MAX = 5000;

export abstract class AbstractSubscription implements ISubscription {
  protected readonly id: string;

  protected readonly userClient: UserClient;

  protected readonly redisClient: RedisClientSubscriber;

  protected readonly debounce: any;

  protected readonly channel: string;

  protected readonly type: SubscriptionType;

  protected messages: IMessage[] = [];

  constructor(userClient: UserClient, dto: SubscriptionDto) {
    this.userClient = userClient;
    this.channel = dto.channel;
    this.type = dto.type;
    this.id = `${this.type}:${this.channel}`;
    this.debounce = debounce(
      () => {
        if (this.messages.length) {
          this.userClient.getSocket().emit(this.id, {
            messages: this.messages.slice(0, MESSAGES_MAX),
            count: this.messages.length,
          } as MessagesResponse);
          this.messages = [];
        }
      },
      EMIT_WAIT,
      {
        maxWait: EMIT_MAX_WAIT,
      },
    );
  }

  getId() {
    return this.id;
  }

  getChannel() {
    return this.channel;
  }

  getType() {
    return this.type;
  }

  abstract subscribe(client: RedisClient): Promise<void>;

  abstract unsubscribe(client: RedisClient): Promise<void>;

  pushMessage(message: IMessage) {
    this.messages.push(message);

    this.debounce();
  }

  toString() {
    return `${this.constructor.name}:${JSON.stringify({
      id: this.id,
      mL: this.messages.length,
    })}`;
  }
}
