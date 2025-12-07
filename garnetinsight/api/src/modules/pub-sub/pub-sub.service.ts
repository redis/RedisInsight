import { HttpException, Injectable, Logger } from '@nestjs/common';
import { UserSessionProvider } from 'src/modules/pub-sub/providers/user-session.provider';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { SubscribeDto } from 'src/modules/pub-sub/dto';
import { SubscriptionProvider } from 'src/modules/pub-sub/providers/subscription.provider';
import { PublishResponse } from 'src/modules/pub-sub/dto/publish.response';
import { PublishDto } from 'src/modules/pub-sub/dto/publish.dto';
import { PubSubAnalyticsService } from 'src/modules/pub-sub/pub-sub.analytics.service';
import { catchAclError } from 'src/utils';
import { ClientMetadata, SessionMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

@Injectable()
export class PubSubService {
  private logger: Logger = new Logger('PubSubService');

  constructor(
    private readonly sessionProvider: UserSessionProvider,
    private readonly subscriptionProvider: SubscriptionProvider,
    private databaseClientFactory: DatabaseClientFactory,
    private analyticsService: PubSubAnalyticsService,
  ) {}

  /**
   * Subscribe to multiple channels
   * @param sessionMetadata
   * @param userClient
   * @param dto
   */
  async subscribe(
    sessionMetadata: SessionMetadata,
    userClient: UserClient,
    dto: SubscribeDto,
  ) {
    try {
      this.logger.debug('Subscribing to channels(s)', sessionMetadata);

      const session = this.sessionProvider.getOrCreateUserSession(
        sessionMetadata,
        userClient,
      );
      await Promise.all(
        dto.subscriptions.map((subDto) =>
          session.subscribe(
            this.subscriptionProvider.createSubscription(userClient, subDto),
          ),
        ),
      );
      this.analyticsService.sendChannelSubscribeEvent(
        sessionMetadata,
        userClient.getDatabaseId(),
        dto.subscriptions,
      );
    } catch (e) {
      this.logger.error('Unable to create subscriptions', e, sessionMetadata);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Unsubscribe from multiple channels
   * @param sessionMetadata
   * @param userClient
   * @param dto
   */
  async unsubscribe(
    sessionMetadata: SessionMetadata,
    userClient: UserClient,
    dto: SubscribeDto,
  ) {
    try {
      this.logger.debug('Unsubscribing from channels(s)', sessionMetadata);

      const session = this.sessionProvider.getOrCreateUserSession(
        sessionMetadata,
        userClient,
      );
      await Promise.all(
        dto.subscriptions.map((subDto) =>
          session.unsubscribe(
            this.subscriptionProvider.createSubscription(userClient, subDto),
          ),
        ),
      );
      this.analyticsService.sendChannelUnsubscribeEvent(
        sessionMetadata,
        userClient.getDatabaseId(),
      );
    } catch (e) {
      this.logger.error('Unable to unsubscribe', e, sessionMetadata);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Publish a message to a particular channel
   * @param clientMetadata
   * @param dto
   */
  async publish(
    clientMetadata: ClientMetadata,
    dto: PublishDto,
  ): Promise<PublishResponse> {
    try {
      this.logger.debug('Publishing message.', clientMetadata);

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const affected = await client.publish(dto.channel, dto.message);

      this.analyticsService.sendMessagePublishedEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
        affected,
      );

      return {
        affected,
      };
    } catch (e) {
      this.logger.error('Unable to publish a message', e, clientMetadata);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Handle Socket disconnection event
   * Basically destroy the UserSession to remove Redis connection
   * @param id
   */
  async handleDisconnect(id: string) {
    this.logger.debug(`Handle disconnect event: ${id}`);
    const session = this.sessionProvider.getUserSession(id);

    if (session) {
      session.destroy();
      this.sessionProvider.removeUserSession(id);
    }
  }
}
