import { ServerInfoNotFoundException } from 'src/constants';
import { ServerService } from 'src/modules/server/server.service';
import { ServerRepository } from 'src/modules/server/repositories/server.repository';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { GetServerInfoResponse } from 'src/modules/server/dto/server.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { SessionMetadata } from 'src/common/models';

const SERVER_CONFIG = config.get('server') as Config['server'];
const REDIS_STACK_CONFIG = config.get('redisStack') as Config['redisStack'];

@Injectable()
export class LocalServerService extends ServerService {
  constructor(
    private readonly repository: ServerRepository,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  public async init(sessionMetadata?: SessionMetadata): Promise<boolean> {
    this.logger.debug('Initializing server module...', sessionMetadata);

    let firstStart = true;

    if (await this.repository.exists(sessionMetadata)) {
      this.logger.debug('First application launch.', sessionMetadata);
      firstStart = false;
    }

    await this.repository.getOrCreate(sessionMetadata);

    return firstStart;
  }

  /**
   * @inheritDoc
   */
  public async getInfo(
    sessionMetadata: SessionMetadata,
  ): Promise<GetServerInfoResponse> {
    this.logger.debug('Getting server info.', sessionMetadata);
    try {
      const info = await this.repository.getOrCreate(sessionMetadata);

      if (!info) {
        return Promise.reject(new ServerInfoNotFoundException());
      }

      const result = {
        ...info,
        sessionId: this.sessionId,
        appVersion: SERVER_CONFIG.appVersion,
        osPlatform: process.platform,
        buildType: SERVER_CONFIG.buildType,
        appType: ServerService.getAppType(SERVER_CONFIG.buildType),
        encryptionStrategies:
          await this.encryptionService.getAvailableEncryptionStrategies(),
        fixedDatabaseId: REDIS_STACK_CONFIG?.id,
        packageType: ServerService.getPackageType(SERVER_CONFIG.buildType),
      };

      this.logger.debug('Succeed to get server info.', sessionMetadata);
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to get application settings.',
        error,
        sessionMetadata,
      );
      throw new InternalServerErrorException();
    }
  }
}
