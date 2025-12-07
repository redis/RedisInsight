import { find, forEach, isBoolean } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { FeatureRepository } from 'src/modules/feature/repositories/feature.repository';
import {
  FeatureServerEvents,
  FeatureStorage,
} from 'src/modules/feature/constants';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { FeatureFlagProvider } from 'src/modules/feature/providers/feature-flag/feature-flag.provider';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FeatureAnalytics } from 'src/modules/feature/feature.analytics';
import { knownFeatures } from 'src/modules/feature/constants/known-features';
import { Feature, FeaturesFlags } from 'src/modules/feature/model/feature';
import { FeatureService } from 'src/modules/feature/feature.service';
import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { SessionMetadata } from 'src/common/models';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';

@Injectable()
export class LocalFeatureService extends FeatureService {
  private logger = new Logger('LocalFeatureService');

  constructor(
    private readonly repository: FeatureRepository,
    private readonly featuresConfigRepository: FeaturesConfigRepository,
    private readonly featureFlagProvider: FeatureFlagProvider,
    private readonly eventEmitter: EventEmitter2,
    private readonly analytics: FeatureAnalytics,
    private readonly featuresConfigService: FeaturesConfigService,
    private readonly constantsProvider: ConstantsProvider,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  async getByName(
    sessionMetadata: SessionMetadata,
    name: string,
  ): Promise<Feature> {
    try {
      switch (knownFeatures[name]?.storage) {
        case FeatureStorage.Database:
          return await this.repository.get(sessionMetadata, name);
        case FeatureStorage.Custom:
          return knownFeatures[name].factory?.();
        default:
          return null;
      }
    } catch (e) {
      return null;
    }
  }

  /**
   * @inheritDoc
   */
  async isFeatureEnabled(
    sessionMetadata: SessionMetadata,
    name: string,
  ): Promise<boolean> {
    try {
      switch (knownFeatures[name]?.storage) {
        case FeatureStorage.Database:
          return (
            (await this.repository.get(sessionMetadata, name))?.flag === true
          );
        case FeatureStorage.Custom:
          return knownFeatures[name].factory?.()?.flag === true;
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * @inheritDoc
   */
  async list(sessionMetadata: SessionMetadata): Promise<FeaturesFlags> {
    this.logger.debug('Getting features list', sessionMetadata);

    const features = {};

    const featuresFromDatabase = await this.repository.list(sessionMetadata);

    forEach(knownFeatures, (feature) => {
      // todo: implement various storage strategies support with next features
      switch (feature?.storage) {
        case FeatureStorage.Database: {
          const dbFeature = find(featuresFromDatabase, { name: feature.name });
          if (dbFeature) {
            features[feature.name] = {
              name: dbFeature.name,
              flag: dbFeature.flag,
              strategy: dbFeature.strategy || undefined,
              data: dbFeature.data || undefined,
            };
          }
          break;
        }
        case FeatureStorage.Custom:
          features[feature.name] = feature?.factory?.();
          break;
        default:
        // do nothing
      }
    });

    return {
      features,
      ...(await this.featuresConfigService.getControlInfo(sessionMetadata)),
    };
  }

  /**
   * Recalculate flags for database features based on controlGroup and new conditions
   * Fires by EventEmitter from FeaturesConfigService when feature config was updated
   * Note: This method is needed when feature config auto update is enabled
   */
  @OnEvent(FeatureServerEvents.FeaturesRecalculate)
  async recalculateFeatureFlags(
    // todo: [USER_CONTEXT] revise
    sessionMetadata = this.constantsProvider.getSystemSessionMetadata(),
  ) {
    this.logger.debug('Recalculating features flags', sessionMetadata);

    try {
      const actions = {
        toUpsert: [],
        toDelete: [],
      };

      const featuresFromDatabase = await this.repository.list(sessionMetadata);
      const featuresConfig =
        await this.featuresConfigRepository.getOrCreate(sessionMetadata);

      this.logger.debug(
        'Recalculating features flags for new config',
        featuresConfig,
      );

      await Promise.all(
        Array.from(
          featuresConfig?.data?.features || new Map(),
          async ([name, feature]) => {
            if (knownFeatures[name]) {
              actions.toUpsert.push({
                ...(await this.featureFlagProvider.calculate(
                  sessionMetadata,
                  knownFeatures[name],
                  feature,
                )),
              });
            }
          },
        ),
      );

      // calculate to delete features
      actions.toDelete = featuresFromDatabase.filter(
        (feature) => !featuresConfig?.data?.features?.has?.(feature.name),
      );

      // delete features
      await Promise.all(
        actions.toDelete.map((feature) =>
          this.repository.delete(sessionMetadata, feature.name),
        ),
      );
      // upsert modified features
      await Promise.all(
        actions.toUpsert.map((feature) =>
          this.repository.upsert(sessionMetadata, feature),
        ),
      );

      this.logger.debug(
        `Features flags recalculated. Updated: ${actions.toUpsert.length} deleted: ${actions.toDelete.length}`,
        sessionMetadata,
      );

      const list = await this.list(sessionMetadata);
      this.eventEmitter.emit(FeatureServerEvents.FeaturesRecalculated, list);

      try {
        this.analytics.sendFeatureFlagRecalculated(sessionMetadata, {
          configVersion: (
            await this.featuresConfigRepository.getOrCreate(sessionMetadata)
          )?.data?.version,
          features: list.features,
          force: await this.listOfForceFlags(),
        });
      } catch (e) {
        // ignore telemetry error
      }
    } catch (e) {
      this.logger.error(
        'Unable to recalculate features flags',
        e,
        sessionMetadata,
      );
    }
  }

  /**
   * Find forced flags values from custom config using only known features list
   * This method is needed during feature flags recalculation only
   */
  private async listOfForceFlags(): Promise<Record<string, boolean>> {
    try {
      const features = {};
      const forceFeatures = await FeatureFlagStrategy.getCustomConfig();

      forEach(knownFeatures, (known) => {
        if (isBoolean(forceFeatures[known.name])) {
          features[known.name] = forceFeatures[known.name];
        }
      });

      return features;
    } catch (e) {
      return {};
    }
  }
}
