import { filter, find } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { wrapHttpError } from 'src/common/utils';
import {
  CloudRequestUtm,
  ICloudApiCredentials,
} from 'src/modules/cloud/common/models';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { FeatureService } from 'src/modules/feature/feature.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { CloudSubscriptionCapiService } from './cloud-subscription.capi.service';
import { CloudSubscriptionRegion, CloudSubscriptionType } from './models';
import { CloudSessionService } from '../session/cloud-session.service';
import { parseCloudSubscriptionsCloudRegionsApiResponse } from './utils';
import { CloudSubscriptionApiProvider } from './providers/cloud-subscription.api.provider';
import { CloudSubscriptionPlanResponse } from './dto';

@Injectable()
export class CloudSubscriptionApiService {
  private logger = new Logger('CloudSubscriptionApiService');

  constructor(
    private readonly api: CloudSubscriptionApiProvider,
    private readonly sessionService: CloudSessionService,
    private readonly cloudCapiKeyService: CloudCapiKeyService,
    private readonly cloudSubscriptionCapiService: CloudSubscriptionCapiService,
    private readonly featureService: FeatureService,
  ) {}

  /**
   * Get list of subscription plans and cloud regions
   * @param sessionMetadata
   * @param utm
   */
  async getSubscriptionPlans(
    sessionMetadata: SessionMetadata,
    utm?: CloudRequestUtm,
  ): Promise<CloudSubscriptionPlanResponse[]> {
    return this.api.callWithAuthRetry(sessionMetadata.sessionId, async () => {
      try {
        const [fixedPlans, regions] = await Promise.all([
          this.cloudSubscriptionCapiService.getSubscriptionsPlans(
            await this.cloudCapiKeyService.getCapiCredentials(
              sessionMetadata,
              utm,
            ),
            CloudSubscriptionType.Fixed,
          ),
          this.getCloudRegions(
            await this.sessionService.getSession(sessionMetadata.sessionId),
          ),
        ]);

        const cloudSsoFeature = await this.featureService.getByName(
          sessionMetadata,
          KnownFeatures.CloudSso,
        );

        const freePlans = filter(fixedPlans, (plan) => {
          if (plan.price !== 0) {
            return false;
          }

          if (!cloudSsoFeature?.data?.filterFreePlan?.length) {
            return true;
          }

          return !!cloudSsoFeature.data.filterFreePlan.find(
            (f) =>
              f.expression &&
              new RegExp(f.expression, f.options).test(plan[f?.field]),
          );
        });

        return freePlans.map((plan) => ({
          ...plan,
          details: find(regions, { regionId: plan.regionId }),
        }));
      } catch (e) {
        this.logger.error('Error getting subscription plans', e);
        throw wrapHttpError(
          await this.cloudCapiKeyService.handleCapiKeyUnauthorizedError(
            e,
            sessionMetadata,
          ),
        );
      }
    });
  }

  /**
   * Get list of cloud regions
   * @param credentials
   */
  private async getCloudRegions(
    credentials: ICloudApiCredentials,
  ): Promise<CloudSubscriptionRegion[]> {
    this.logger.debug('Getting cloud regions.');
    try {
      const regions = await this.api.getCloudRegions(credentials);

      this.logger.debug('Succeed to get cloud regions');

      return parseCloudSubscriptionsCloudRegionsApiResponse(regions);
    } catch (error) {
      this.logger.error('Error getting cloud regions', error);
      throw wrapHttpError(error);
    }
  }
}
