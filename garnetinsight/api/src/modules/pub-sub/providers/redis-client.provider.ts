import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { withTimeout } from 'src/utils/promise-with-timeout';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config, { Config } from 'src/utils/config';
import { RedisClientSubscriber } from 'src/modules/pub-sub/model/redis-client-subscriber';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

const serverConfig = config.get('server') as Config['server'];

@Injectable()
export class RedisClientProvider {
  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  createClient(clientMetadata: ClientMetadata): RedisClientSubscriber {
    return new RedisClientSubscriber(
      clientMetadata.databaseId,
      this.getConnectFn(clientMetadata),
    );
  }

  private getConnectFn(clientMetadata: ClientMetadata) {
    return () =>
      withTimeout(
        this.databaseClientFactory.createClient(clientMetadata),
        serverConfig.requestTimeout,
        new ServiceUnavailableException(
          ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB,
        ),
      );
  }
}
