import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { difference, isEmpty, map, cloneDeep } from 'lodash';
import { readFile } from 'fs-extra';
import { join } from 'path';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import config, { Config } from 'src/utils/config';
import { AgreementIsNotDefinedException } from 'src/constants';
import { KeytarEncryptionStrategy } from 'src/modules/encryption/strategies/keytar-encryption.strategy';
import { KeyEncryptionStrategy } from 'src/modules/encryption/strategies/key-encryption.strategy';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { SettingsRepository } from 'src/modules/settings/repositories/settings.repository';
import { classToClass } from 'src/utils';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { FeatureServerEvents } from 'src/modules/feature/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAgreementSpecFile } from 'src/modules/settings/models/agreements.interface';
import { SessionMetadata } from 'src/common/models';

import { DatabaseDiscoveryService } from 'src/modules/database-discovery/database-discovery.service';
import { ToggleAnalyticsReasonType } from 'src/modules/settings/constants/settings';
import {
  GetAgreementsSpecResponse,
  GetAppSettingsResponse,
  UpdateSettingsDto,
} from './dto/settings.dto';
import { EncryptionService } from '../encryption/encryption.service';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class SettingsService {
  private logger = new Logger('SettingsService');

  constructor(
    @Inject(forwardRef(() => DatabaseDiscoveryService))
    private readonly databaseDiscoveryService: DatabaseDiscoveryService,
    private readonly settingsRepository: SettingsRepository,
    private readonly agreementRepository: AgreementsRepository,
    private readonly analytics: SettingsAnalytics,
    private readonly keytarEncryptionStrategy: KeytarEncryptionStrategy,
    private readonly keyEncryptionStrategy: KeyEncryptionStrategy,
    @Inject(forwardRef(() => EncryptionService))
    private readonly encryptionService: EncryptionService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Method to get settings
   */
  public async getAppSettings(
    sessionMetadata: SessionMetadata,
  ): Promise<GetAppSettingsResponse> {
    this.logger.debug('Getting application settings.', sessionMetadata);
    try {
      const settings =
        await this.settingsRepository.getOrCreate(sessionMetadata);

      let defaultOptions: object;
      if (SERVER_CONFIG.acceptTermsAndConditions) {
        const isEncryptionAvailable =
          await this.encryptionService.isEncryptionAvailable();

        defaultOptions = {
          data: {
            analytics: false,
            encryption: isEncryptionAvailable,
            eula: true,
            notifications: false,
          },
          version: (await this.getAgreementsSpec()).version,
        };
      }

      const agreements = await this.agreementRepository.getOrCreate(
        sessionMetadata,
        defaultOptions,
      );

      this.logger.debug(
        'Succeed to get application settings.',
        sessionMetadata,
      );

      return classToClass(GetAppSettingsResponse, {
        ...settings?.data,
        acceptTermsAndConditionsOverwritten:
          SERVER_CONFIG.acceptTermsAndConditions,
        agreements: agreements?.version
          ? {
              ...agreements?.data,
              version: agreements?.version,
            }
          : null,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get application settings.',
        error,
        sessionMetadata,
      );
      throw new InternalServerErrorException();
    }
  }

  /**
   * Method to update application settings and agreements
   * @param sessionMetadata
   * @param dto
   */
  public async updateAppSettings(
    sessionMetadata: SessionMetadata,
    dto: UpdateSettingsDto,
  ): Promise<GetAppSettingsResponse> {
    this.logger.debug('Updating application settings.', sessionMetadata);
    const { agreements, analyticsReason, ...settings } = dto;
    try {
      const oldAppSettings = await this.getAppSettings(sessionMetadata);
      if (!isEmpty(settings)) {
        const model =
          await this.settingsRepository.getOrCreate(sessionMetadata);
        const toUpdate = {
          ...model,
          data: {
            ...model?.data,
            ...settings,
          },
        };

        await this.settingsRepository.update(sessionMetadata, toUpdate);
      }
      if (agreements) {
        await this.updateAgreements(
          sessionMetadata,
          agreements,
          analyticsReason,
        );
      }
      this.logger.debug(
        'Succeed to update application settings.',
        sessionMetadata,
      );
      const results = await this.getAppSettings(sessionMetadata);
      this.analytics.sendSettingsUpdatedEvent(
        sessionMetadata,
        results,
        oldAppSettings,
      );

      this.eventEmitter.emit(FeatureServerEvents.FeaturesRecalculate);

      // Discover databases from envs or autodiscovery flow when eula accept
      if (!oldAppSettings?.agreements?.eula && results?.agreements?.eula) {
        try {
          await this.databaseDiscoveryService.discover(sessionMetadata, true);
        } catch (e) {
          // ignore error
          this.logger.error(
            'Failed discover databases after eula accepted.',
            e,
            sessionMetadata,
          );
        }
      }

      return results;
    } catch (error) {
      this.logger.error(
        'Failed to update application settings.',
        error,
        sessionMetadata,
      );
      if (
        error instanceof AgreementIsNotDefinedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  /**
   * Call for current system's state check for conditional agreements spec
   * @param checker
   * @param defaultOption
   * @private
   */
  private async getAgreementsOption(
    checker: string,
    defaultOption: string,
  ): Promise<string> {
    try {
      // Check if any encryption strategy is available (not KEYTAR only)
      // KEY has a precedence on KEYTAR strategy
      if (checker === 'KEYTAR') {
        const isEncryptionAvailable =
          (await this.keyEncryptionStrategy.isAvailable()) ||
          (await this.keytarEncryptionStrategy.isAvailable());

        if (
          !isEncryptionAvailable &&
          SERVER_CONFIG.buildType === 'REDIS_STACK'
        ) {
          return 'stack_false';
        }

        return `${isEncryptionAvailable}`;
      }
    } catch (e) {
      this.logger.error(`Unable to proceed agreements checker ${checker}`, e);
    }

    return defaultOption;
  }

  /**
   * Try to get agreements from file
   * Shouldn't throw an error on fail
   * @private
   */
  private async getAgreementsSpecFromFile(): Promise<IAgreementSpecFile> {
    try {
      if (SERVER_CONFIG.agreementsPath) {
        return JSON.parse(
          await readFile(join(__dirname, SERVER_CONFIG.agreementsPath), 'utf8'),
        );
      }
    } catch (e) {
      // ignore error
    }

    return cloneDeep<IAgreementSpecFile>(AGREEMENTS_SPEC);
  }

  /**
   * Process conditional agreements where needed and returns proper agreements spec
   */
  public async getAgreementsSpec(): Promise<GetAgreementsSpecResponse> {
    const agreementsSpec = await this.getAgreementsSpecFromFile();

    await Promise.all(
      map(agreementsSpec.agreements, async (agreement: any, name) => {
        if (agreement.conditional) {
          const option = await this.getAgreementsOption(
            agreement.checker,
            agreement.defaultOption,
          );
          agreementsSpec.agreements[name] = agreement.options[option];
        }
      }),
    );

    return agreementsSpec;
  }

  /**
   * Reset agreements to trigger EULA popup again
   * Used for E2E testing
   */
  public async resetAgreements(
    sessionMetadata: SessionMetadata,
  ): Promise<void> {
    this.logger.debug('Resetting application agreements.', sessionMetadata);
    try {
      await this.agreementRepository.reset(sessionMetadata);
      this.logger.debug(
        'Succeed to reset application agreements.',
        sessionMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to reset application agreements.',
        error,
        sessionMetadata,
      );
      throw new InternalServerErrorException();
    }
  }

  private async updateAgreements(
    sessionMetadata: SessionMetadata,
    dtoAgreements: Map<string, boolean> = new Map(),
    analyticsReason?: ToggleAnalyticsReasonType,
  ): Promise<void> {
    this.logger.debug('Updating application agreements.', sessionMetadata);
    const oldAgreements =
      await this.agreementRepository.getOrCreate(sessionMetadata);
    const agreementsSpec = await this.getAgreementsSpecFromFile();

    const newAgreements = {
      ...oldAgreements,
      version: agreementsSpec.version,
      data: {
        ...oldAgreements.data,
        ...Object.fromEntries(dtoAgreements),
      },
    };
    // Detect which agreements should be defined according to the settings specification
    const diff = difference(
      Object.keys(agreementsSpec.agreements),
      Object.keys(newAgreements.data),
    );
    if (diff.length) {
      const messages = diff.map(
        (item: string) => `agreements.${item} should not be null or undefined`,
      );
      throw new AgreementIsNotDefinedException(messages);
    }

    await this.agreementRepository.update(sessionMetadata, newAgreements);

    if (dtoAgreements.has('analytics')) {
      this.analytics.sendAnalyticsAgreementChange(
        sessionMetadata,
        dtoAgreements,
        new Map(Object.entries(oldAgreements.data || {})),
        analyticsReason,
      );
    }
  }
}
