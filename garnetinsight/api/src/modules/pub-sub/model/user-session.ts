import { RedisClientSubscriber } from 'src/modules/pub-sub/model/redis-client-subscriber';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { ISubscription } from 'src/modules/pub-sub/interfaces/subscription.interface';
import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';
import {
  PubSubServerEvents,
  RedisClientSubscriberEvents,
} from 'src/modules/pub-sub/constants';
import { Logger } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { PubSubWsException } from 'src/modules/pub-sub/errors/pub-sub-ws.exception';

export class UserSession {
  private readonly logger: Logger = new Logger('UserSession');

  private readonly id: string;

  private readonly userClient: UserClient;

  private readonly redisClient: RedisClientSubscriber;

  private subscriptions: Map<string, ISubscription> = new Map();

  constructor(userClient: UserClient, redisClient: RedisClientSubscriber) {
    this.id = userClient.getId();
    this.userClient = userClient;
    this.redisClient = redisClient;
    redisClient.on(
      RedisClientSubscriberEvents.Message,
      this.handleMessage.bind(this),
    );
    redisClient.on(
      RedisClientSubscriberEvents.End,
      this.handleDisconnect.bind(this),
    );
  }

  getId() {
    return this.id;
  }

  getUserClient() {
    return this.userClient;
  }

  getRedisClient() {
    return this.redisClient;
  }

  /**
   * Subscribe to a Pub/Sub channel and create Redis client connection if needed
   * Also add subscription to the subscriptions list
   * @param subscription
   */
  async subscribe(subscription: ISubscription) {
    this.logger.debug(
      `Subscribe ${subscription} ${this}. Getting Redis client...`,
    );

    const client = await this.redisClient?.getClient();

    if (!client) {
      throw new Error('There is no Redis client initialized');
    }

    if (!this.subscriptions.has(subscription.getId())) {
      this.subscriptions.set(subscription.getId(), subscription);
      this.logger.debug(`Subscribe to Redis ${subscription} ${this}`);
      await subscription.subscribe(client);
    }
  }

  /**
   * Unsubscribe from a channel and remove from the list of subscriptions
   * Also destroy redis client when no subscriptions left
   * @param subscription
   */
  async unsubscribe(subscription: ISubscription) {
    this.logger.debug(`Unsubscribe ${subscription} ${this}`);

    this.subscriptions.delete(subscription.getId());

    const client = await this.redisClient?.getClient();

    if (client) {
      this.logger.debug(`Unsubscribe from Redis ${subscription} ${this}`);
      await subscription.unsubscribe(client);

      if (!this.subscriptions.size) {
        this.logger.debug(`Unsubscribe: Destroy RedisClient ${this}`);
        this.redisClient.destroy();
      }
    }
  }

  /**
   * Redirect message to a proper subscription from the list using id
   * ID is generated in this way: "p:channelName" where "p" - is a type of subscription
   * Subscription types: s - "subscribe", p - "psubscribe", ss - "ssubscribe"
   * @param id
   * @param message
   */
  handleMessage(id: string, message: IMessage) {
    const subscription = this.subscriptions.get(id);

    if (subscription) {
      subscription.pushMessage(message);
    }
  }

  /**
   * Handle socket disconnection
   * In this case we need to destroy entire session and cascade destroy other models inside
   * to be sure that there is no open connections left
   */
  handleDisconnect() {
    this.logger.debug(`Handle disconnect ${this}`);

    this.userClient
      .getSocket()
      .emit(
        PubSubServerEvents.Exception,
        new PubSubWsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
      );

    this.destroy();
  }

  /**
   * Reset subscriptions map and call and destroy Redis client
   */
  destroy() {
    this.logger.debug(`Destroy ${this}`);

    this.subscriptions = new Map();
    this.redisClient.destroy();

    this.logger.debug(`Destroyed ${this}`);
  }

  toString() {
    return `UserSession:${JSON.stringify({
      id: this.id,
      subscriptionsSize: this.subscriptions.size,
      subscriptions: [...this.subscriptions.keys()],
    })}`;
  }
}
