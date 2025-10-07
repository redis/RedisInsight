import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GoogleIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/google-idp.cloud.auth-strategy';
import {
  CloudAuthIdpType,
  CloudAuthRequest,
  CloudAuthRequestOptions,
} from 'src/modules/cloud/auth/models/cloud-auth-request';
import { CloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/cloud-auth.strategy';
import { SessionMetadata } from 'src/common/models';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { GithubIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/github-idp.cloud.auth-strategy';
import { SsoIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/sso-idp.cloud.auth-strategy';
import { wrapHttpError } from 'src/common/utils';
import {
  CloudOauthCanceledException,
  CloudOauthGithubEmailPermissionException,
  CloudOauthMisconfigurationException,
  CloudOauthMissedRequiredDataException,
  CloudOauthUnexpectedErrorException,
  CloudOauthUnknownAuthorizationRequestException,
} from 'src/modules/cloud/auth/exceptions';
import {
  CloudAuthRequestInfo,
  CloudAuthResponse,
  CloudAuthStatus,
} from 'src/modules/cloud/auth/models';
import { CloudAuthAnalytics } from 'src/modules/cloud/auth/cloud-auth.analytics';
import { CloudSsoFeatureStrategy } from 'src/modules/cloud/cloud-sso.feature.flag';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CloudAuthServerEvent } from 'src/modules/cloud/common/constants';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudOauthSsoUnsupportedEmailException } from 'src/modules/cloud/auth/exceptions/cloud-oauth.sso-unsupported-email.exception';
import { MicrosoftIdpCloudAuthStrategy } from './auth-strategy/microsoft-idp.cloud.auth-strategy';

@Injectable()
export class CloudAuthService {
  private readonly logger = new Logger('CloudAuthService');

  private authRequests: Map<string, CloudAuthRequest> = new Map();

  private inProgressRequests: Map<string, CloudAuthRequest> = new Map();

  constructor(
    private readonly sessionService: CloudSessionService,
    private readonly googleIdpAuthStrategy: GoogleIdpCloudAuthStrategy,
    private readonly microsoftIdpAuthStrategy: MicrosoftIdpCloudAuthStrategy,
    private readonly githubIdpCloudAuthStrategy: GithubIdpCloudAuthStrategy,
    private readonly ssoIdpCloudAuthStrategy: SsoIdpCloudAuthStrategy,
    private readonly analytics: CloudAuthAnalytics,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  static getOAuthHttpRequestHeaders() {
    return {
      accept: 'application/json',
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded',
    };
  }

  static getAuthorizationServerRedirectError(
    query: { error_description: string; error: string },
    authRequest?: CloudAuthRequest,
  ) {
    if (query?.error_description?.indexOf('canceled') > -1) {
      return new CloudOauthCanceledException();
    }

    if (
      query?.error_description?.indexOf('propert') > -1 &&
      query?.error_description?.indexOf('required') > -1 &&
      query?.error_description?.indexOf('miss') > -1
    ) {
      return authRequest?.idpType === CloudAuthIdpType.GitHub &&
        query?.error_description?.indexOf('email') > -1
        ? new CloudOauthGithubEmailPermissionException(query.error_description)
        : new CloudOauthMissedRequiredDataException(query.error_description, {
            description: query.error_description,
          });
    }

    return new CloudOauthUnexpectedErrorException(undefined, {
      description: query.error_description,
    });
  }

  getAuthStrategy(strategy: CloudAuthIdpType): CloudAuthStrategy {
    switch (strategy) {
      case CloudAuthIdpType.Google:
        return this.googleIdpAuthStrategy;
      case CloudAuthIdpType.Microsoft:
        return this.microsoftIdpAuthStrategy;
      case CloudAuthIdpType.GitHub:
        return this.githubIdpCloudAuthStrategy;
      case CloudAuthIdpType.Sso:
        return this.ssoIdpCloudAuthStrategy;
      default:
        throw new CloudOauthUnknownAuthorizationRequestException(
          'Unknown cloud auth strategy',
        );
    }
  }

  /**
   * Returns authorization url to open in the native browser to initialize oauth flow
   * @param sessionMetadata
   * @param options
   */
  async getAuthorizationUrl(
    sessionMetadata: SessionMetadata,
    options: CloudAuthRequestOptions,
  ): Promise<string> {
    try {
      const authRequest: any = await this.getAuthStrategy(
        options?.strategy,
      ).generateAuthRequest(sessionMetadata, options);
      authRequest.callback = options?.callback;
      authRequest.action = options?.action;

      // based on requirements we must support only single auth request at the moment
      // and logout user before
      await this.logout(sessionMetadata);
      this.authRequests.clear();
      this.authRequests.set(authRequest.state, authRequest);

      return CloudAuthStrategy.generateAuthUrl(authRequest).toString();
    } catch (e) {
      this.logger.error('Unable to generate authorization url', e);

      if (e instanceof CloudOauthSsoUnsupportedEmailException) {
        throw e;
      }

      throw new CloudOauthMisconfigurationException(undefined, { cause: e });
    }
  }

  /**
   * Exchange authorization code for a tokens
   * @param authRequest
   * @param code
   */
  private async exchangeCode(
    authRequest: CloudAuthRequest,
    code: string,
  ): Promise<any> {
    try {
      const tokenUrl = CloudAuthStrategy.generateExchangeCodeUrl(
        authRequest,
        code,
      );

      const { data } = await axios.post(
        tokenUrl.toString().split('?')[0],
        tokenUrl.searchParams,
        {
          headers: CloudAuthService.getOAuthHttpRequestHeaders(),
        },
      );

      if (
        authRequest.idpType === CloudAuthIdpType.Microsoft &&
        data.access_token
      ) {
        const accessToken = data.access_token;

        // Step 2: List Azure Subscriptions
        const listAzureSubscriptions = async (): Promise<any[]> => {
          try {
            const url = `https://management.azure.com/subscriptions?api-version=2024-08-01`;
            const response = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            this.logger.log('Subscriptions found:', response.data.value);
            return response.data.value;
          } catch (e) {
            this.logger.error(
              'Failed to fetch Azure subscriptions',
              e.response?.data || e.message,
            );
            throw wrapHttpError(e);
          }
        };

        const subscriptions = await listAzureSubscriptions();

        // Step 3: For each subscription, fetch Resource Groups and Redis instances
        const listResourceGroups = async (
          subscriptionId: string,
        ): Promise<any[]> => {
          try {
            const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2024-08-01`;
            const response = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            return response.data.value;
          } catch (e) {
            this.logger.error(
              'Failed to fetch Resource Groups',
              e.response?.data || e.message,
            );
            throw wrapHttpError(e);
          }
        };

        // Step 4: Get access keys for each Redis instance. Access key is used as a password for the authentication with the current auth implementation
        const getRedisInstanceAccessKeys = async (
          subscriptionId: string,
          resourceGroupName: string,
          redisInstanceName: string,
        ): Promise<any[]> => {
          try {
            const keysUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Cache/Redis/${redisInstanceName}/listKeys?api-version=2024-11-01`;
            const keysResponse = await axios.post(keysUrl, null, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            return keysResponse.data.primaryKey;
          } catch (e) {
            this.logger.error(
              `Failed to fetch keys for Redis instance ${redisInstanceName}`,
              e.response?.data || e.message,
            );
            return null;
          }
        };

        const listAzureRedisDatabases = async (
          subscriptionId: string,
          resourceGroupName: string,
        ): Promise<any[]> => {
          try {
            // Get Redis instances list
            const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Cache/Redis?api-version=2024-11-01`;
            const response = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            // For each Redis instance, get access keys
            const redisInstances = await Promise.all(
              response.data.value.map(async (instance) => {
                const accessKey = await getRedisInstanceAccessKeys(
                  subscriptionId,
                  resourceGroupName,
                  instance.name,
                );
                return {
                  ...instance,
                  connectionDetails: {
                    hostName: instance.properties.hostName,
                    port: instance.properties.sslPort, // might need to check additionally if there are other available ports
                    accessKey,
                    username: instance.properties.userName || 'default',
                  },
                };
              }),
            );

            return redisInstances;
          } catch (e) {
            console.log(
              'Failed to fetch Redis Databases',
              subscriptionId,
              resourceGroupName,
              e.response?.data || e.message,
            );
            // removed throwing for the POC because we are going over ALL resources and don't want to stop due to 1 error
            // throw wrapHttpError(e);
          }
        };

        const results: any[] = [];

        for (const subscription of subscriptions) {
          const subscriptionId = subscription.subscriptionId;
          const resourceGroups = await listResourceGroups(subscriptionId);

          for (const resourceGroup of resourceGroups) {
            const redisInstances = await listAzureRedisDatabases(
              subscriptionId,
              resourceGroup.name,
            );
            // Only add to results if redisInstances exists and has length
            if (redisInstances?.length > 0) {
              results.push({
                subscriptionId,
                resourceGroup: resourceGroup.name,
                redisInstances,
              });
            }
          }
        }

        // Log only results with Redis instances
        results.forEach((result) => {
          console.log('Azure Redis Databases result', result);
          result.redisInstances.forEach((redisInstance) => {
            console.log('Azure Redis Database instance details:', {
              name: redisInstance.name,
              connectionDetails: redisInstance.connectionDetails,
              properties: redisInstance.properties,
            });
          });
        });

        return {
          accessToken,
          redisData: results,
        };
      }

      return data; // Default return if idpType is not Microsoft
    } catch (e) {
      this.logger.error('Unable to exchange code', e);

      // todo: handle this?
      throw wrapHttpError(e);
    }
  }

  /**
   * Get some useful not sensitive information about auth request for analytics purpose
   * Will not remove auth request from the pool
   * @param query
   * @private
   */
  private async getAuthRequestInfo(query): Promise<CloudAuthRequestInfo> {
    if (!this.authRequests.has(query?.state)) {
      this.logger.log(
        `${query?.state ? 'Auth Request matching query state not found' : 'Query state field is empty'}`,
      );
      throw new CloudOauthUnknownAuthorizationRequestException();
    }

    const authRequest = this.authRequests.get(query.state);

    return {
      idpType: authRequest.idpType,
      action: authRequest.action,
      sessionMetadata: authRequest.sessionMetadata,
    };
  }

  /**
   * Process oauth callback
   * Exchanges code and modify user session
   * Generates proper errors
   * @param query
   */
  private async callback(query): Promise<Function | void> {
    if (!this.authRequests.has(query?.state)) {
      this.logger.log(
        `${query?.state ? 'Auth Request matching query state not found' : 'Query state field is empty'}`,
      );
      throw new CloudOauthUnknownAuthorizationRequestException();
    }

    const authRequest = this.authRequests.get(query.state);

    if (query?.error) {
      this.logger.error(`Query has error field: query.error: ${query.error},
        query.error_description: ${query.error_description}`);
      throw CloudAuthService.getAuthorizationServerRedirectError(
        query,
        authRequest,
      );
    }

    // delete authRequest on this step
    // allow to redirect with authorization code only once
    this.authRequests.delete(query.state);
    // Track in progress auth requests to avoid errors when for some reason many we receive many the same calls
    this.inProgressRequests.set(query.state, authRequest);

    const tokens = await this.exchangeCode(authRequest, query.code);

    await this.sessionService.updateSessionData(
      authRequest.sessionMetadata.sessionId,
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idpType: authRequest.idpType,
      },
    );

    return authRequest.callback;
  }

  private async revokeRefreshToken(
    sessionMetadata: SessionMetadata,
  ): Promise<void> {
    try {
      const session = await this.sessionService.getSession(
        sessionMetadata.sessionId,
      );
      if (!session?.refreshToken) {
        return;
      }

      const strategy = this.getAuthStrategy(session.idpType);

      const tokenUrl = strategy.generateRevokeTokensUrl(
        session.refreshToken,
        'refresh_token',
      );

      await axios.post(
        tokenUrl.toString().split('?')[0],
        tokenUrl.searchParams,
        {
          headers: CloudAuthService.getOAuthHttpRequestHeaders(),
        },
      );
    } catch (e) {
      // ignore error
      this.logger.error('Unable to revoke tokens', e, sessionMetadata);
    }
  }

  /**
   * Handle OAuth callback from Web or by deep link
   * @param query
   * @param from
   */
  async handleCallback(
    query,
    from = CloudSsoFeatureStrategy.DeepLink,
  ): Promise<CloudAuthResponse> {
    this.logger.log(
      `Handling a callback with a query having ${Object.keys(query || {}).toString()} keys`,
    );
    let result: CloudAuthResponse = {
      status: CloudAuthStatus.Succeed,
      message: 'Successfully authenticated',
    };

    let callback;
    let reqInfo: CloudAuthRequestInfo;
    try {
      reqInfo = await this.getAuthRequestInfo(query);
      callback = await this.callback(query);
      this.analytics.sendCloudSignInSucceeded(
        reqInfo.sessionMetadata,
        from,
        reqInfo?.action,
      );
    } catch (e) {
      this.logger.error(
        `Error on ${from} cloud oauth callback: ${e.message}`,
        e,
      );

      this.analytics.sendCloudSignInFailed(
        reqInfo?.sessionMetadata,
        e,
        from,
        reqInfo?.action,
      );

      result = {
        status: CloudAuthStatus.Failed,
        error: wrapHttpError(e).getResponse(),
      };
    }

    try {
      if (!callback) {
        this.logger.log('Callback is undefined');
      }
      callback?.(result)?.catch((e: Error) =>
        this.logger.error('Async callback failed', e),
      );
    } catch (e) {
      this.logger.error('Callback failed', e);
    }

    return result;
  }

  async renewTokens(
    sessionMetadata: SessionMetadata,
    idpType: CloudAuthIdpType,
    refreshToken: string,
  ) {
    try {
      const strategy = this.getAuthStrategy(idpType);

      const tokenUrl = strategy.generateRenewTokensUrl(refreshToken);

      const { data } = await axios.post(
        tokenUrl.toString().split('?')[0],
        tokenUrl.searchParams,
        {
          headers: CloudAuthService.getOAuthHttpRequestHeaders(),
        },
      );

      await this.sessionService.updateSessionData(sessionMetadata.sessionId, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idpType,
        csrf: null,
        apiSessionId: null,
      });
    } catch (e) {
      this.logger.error('Unable to renew tokens', e);
      throw new CloudApiUnauthorizedException(e.message);
    }
  }

  /**
   * Logout user
   * Basically cleans current user session
   * @param sessionMetadata
   */
  async logout(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      this.logger.debug('Logout cloud user', sessionMetadata);

      await this.revokeRefreshToken(sessionMetadata);

      await this.sessionService.deleteSessionData(sessionMetadata.sessionId);

      this.eventEmitter.emit(CloudAuthServerEvent.Logout, sessionMetadata);
    } catch (e) {
      this.logger.error('Unable to logout', e, sessionMetadata);
      throw wrapHttpError(e);
    }
  }

  isRequestInProgress(query) {
    return !!this.inProgressRequests.has(query?.state);
  }

  finishInProgressRequest(query) {
    this.inProgressRequests.delete(query?.state);
  }
}
