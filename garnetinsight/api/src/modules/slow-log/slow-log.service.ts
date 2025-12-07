import { concat } from 'lodash';
import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SlowLog, SlowLogConfig } from 'src/modules/slow-log/models';
import {
  SlowLogArguments,
  SlowLogCommands,
} from 'src/modules/slow-log/constants/commands';
import { catchAclError } from 'src/utils';
import { UpdateSlowLogConfigDto } from 'src/modules/slow-log/dto/update-slow-log-config.dto';
import { GetSlowLogsDto } from 'src/modules/slow-log/dto/get-slow-logs.dto';
import { SlowLogAnalytics } from 'src/modules/slow-log/slow-log.analytics';
import { ClientMetadata } from 'src/common/models';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  RedisClient,
  RedisClientConnectionType,
} from 'src/modules/redis/client';

@Injectable()
export class SlowLogService {
  private logger = new Logger('SlowLogService');

  constructor(
    private databaseClientFactory: DatabaseClientFactory,
    private analyticsService: SlowLogAnalytics,
  ) {}

  /**
   * Get slow logs for each node and return concatenated result
   * @param clientMetadata
   * @param dto
   */
  async getSlowLogs(clientMetadata: ClientMetadata, dto: GetSlowLogsDto) {
    try {
      this.logger.debug('Getting slow logs', clientMetadata);

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const nodes = await client.nodes();

      return concat(
        ...(await Promise.all(
          nodes.map((node) => this.getNodeSlowLogs(node, dto)),
        )),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get array of slow logs for particular node
   * @param node
   * @param dto
   */
  async getNodeSlowLogs(
    node: RedisClient,
    dto: GetSlowLogsDto,
  ): Promise<SlowLog[]> {
    const resp = (await node.call(
      [SlowLogCommands.SlowLog, SlowLogArguments.Get, dto.count],
      { replyEncoding: 'utf8' },
    )) as string[][] | number[][];

    return resp.map((log) => {
      const [id, time, durationUs, args, source, client] = log;
      return {
        id,
        time,
        durationUs,
        args: args.join(' '),
        source,
        client,
      };
    });
  }

  /**
   * Clear slow logs in all nodes
   * @param clientMetadata
   */
  async reset(clientMetadata: ClientMetadata): Promise<void> {
    try {
      this.logger.debug('Resetting slow logs', clientMetadata);

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const nodes = await client.nodes();

      await Promise.all(
        nodes.map((node) =>
          node.call([SlowLogCommands.SlowLog, SlowLogArguments.Reset]),
        ),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get current slowlog config to show for user
   * @param clientMetadata
   */
  async getConfig(clientMetadata: ClientMetadata): Promise<SlowLogConfig> {
    try {
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const resp = convertArrayReplyToObject(
        (await client.call(
          [SlowLogCommands.Config, SlowLogArguments.Get, 'slowlog*'],
          { replyEncoding: 'utf8' },
        )) as string[],
      );

      return {
        slowlogMaxLen: parseInt(resp['slowlog-max-len'], 10) || 0,
        slowlogLogSlowerThan:
          parseInt(resp['slowlog-log-slower-than'], 10) || 0,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Update slowlog config
   * @param clientMetadata
   * @param dto
   */
  async updateConfig(
    clientMetadata: ClientMetadata,
    dto: UpdateSlowLogConfigDto,
  ): Promise<SlowLogConfig> {
    try {
      const commands = [];
      const config = await this.getConfig(clientMetadata);
      const { slowlogLogSlowerThan, slowlogMaxLen } = config;

      if (dto.slowlogLogSlowerThan !== undefined) {
        commands.push({
          command: SlowLogCommands.Config,
          args: [
            SlowLogArguments.Set,
            'slowlog-log-slower-than',
            dto.slowlogLogSlowerThan,
          ],
          analytics: () =>
            this.analyticsService.slowLogLogSlowerThanUpdated(
              clientMetadata.sessionMetadata,
              clientMetadata.databaseId,
              slowlogLogSlowerThan,
              dto.slowlogLogSlowerThan,
            ),
        });

        config.slowlogLogSlowerThan = dto.slowlogLogSlowerThan;
      }

      if (dto.slowlogMaxLen !== undefined) {
        commands.push({
          command: SlowLogCommands.Config,
          args: [SlowLogArguments.Set, 'slowlog-max-len', dto.slowlogMaxLen],
          analytics: () =>
            this.analyticsService.slowLogMaxLenUpdated(
              clientMetadata.sessionMetadata,
              clientMetadata.databaseId,
              slowlogMaxLen,
              dto.slowlogMaxLen,
            ),
        });

        config.slowlogMaxLen = dto.slowlogMaxLen;
      }

      if (commands.length) {
        const client =
          await this.databaseClientFactory.getOrCreateClient(clientMetadata);

        if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
          return Promise.reject(
            new BadRequestException(
              'Configuration slowlog for cluster is deprecated',
            ),
          );
        }
        await Promise.all(
          commands.map((command) =>
            client
              .call([command.command, ...command.args])
              .then(command.analytics),
          ),
        );
      }

      return config;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }
}
