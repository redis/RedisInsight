import { uniqBy, isNull } from 'lodash';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { Injectable, Logger } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { SessionMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { classToClass } from 'src/utils';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import {
  discoverEnvDatabasesToAdd,
  discoverFileDatabasesToAdd,
} from 'src/modules/database-discovery/utils/pre-setup.discovery.util';

const DIR_CONFIG = config.get('dir_path') as Config['dir_path'];
const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class PreSetupDatabaseDiscoveryService {
  private logger = new Logger('LocalPreSetupDatabaseDiscoveryService');

  constructor(
    private readonly databaseRepository: DatabaseRepository,
    private readonly caCertificateRepository: CaCertificateRepository,
    private readonly clientCertificateRepository: ClientCertificateRepository,
  ) {}

  private async addDatabase(
    sessionMetadata: SessionMetadata,
    toAdd: Database,
  ): Promise<string> {
    try {
      const database = classToClass(Database, toAdd);

      if (database.caCert) {
        await this.caCertificateRepository.create(database.caCert, false);
        database.caCert = { id: database.caCert.id } as CaCertificate;
      }

      if (database.clientCert) {
        await this.clientCertificateRepository.create(
          database.clientCert,
          false,
        );
        database.clientCert = {
          id: database.clientCert.id,
        } as ClientCertificate;
      }

      await this.databaseRepository.create(sessionMetadata, database, false);

      return database.id;
    } catch (e) {
      return null;
    }
  }

  private async cleanupPreSetupData(
    sessionMetadata: SessionMetadata,
    excludeIds: string[],
  ): Promise<void> {
    await Promise.all([
      // cleanup databases
      this.databaseRepository.cleanupPreSetup(excludeIds).catch((e) => {
        this.logger.warn(
          'Unable to cleanup pre setup databases',
          e,
          sessionMetadata,
        );
      }),
      // cleanup databases
      this.caCertificateRepository.cleanupPreSetup(excludeIds).catch((e) => {
        this.logger.warn(
          'Unable to cleanup pre setup CA certificates',
          e,
          sessionMetadata,
        );
      }),
      // cleanup user certificates
      this.clientCertificateRepository
        .cleanupPreSetup(excludeIds)
        .catch((e) => {
          this.logger.warn(
            'Unable to cleanup pre setup user certificates',
            e,
            sessionMetadata,
          );
        }),
    ]);
  }

  async discover(
    sessionMetadata: SessionMetadata,
  ): Promise<{ discovered: number }> {
    let addedIds: string[] = [];

    try {
      // no need to auto discover for Redis Stack
      if (SERVER_CONFIG.buildType === 'REDIS_STACK') {
        return { discovered: 0 };
      }

      const envDatabasesToAdd = await discoverEnvDatabasesToAdd();
      const fileDatabasesToAdd = await discoverFileDatabasesToAdd(
        DIR_CONFIG.preSetupDatabases,
      );
      const databasesToAdd = uniqBy(
        [...envDatabasesToAdd, ...fileDatabasesToAdd],
        'id',
      );

      if (databasesToAdd.length > 0) {
        addedIds = (
          await Promise.all(
            databasesToAdd.map((database) =>
              this.addDatabase(sessionMetadata, database),
            ),
          )
        ).filter((v) => !isNull(v));
      }

      await this.cleanupPreSetupData(sessionMetadata, addedIds);
    } catch (e) {
      // ignore error
      this.logger.error('Unable to discover databases', e);
    }

    return {
      discovered: addedIds.length,
    };
  }
}
