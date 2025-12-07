import { find } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudUser, CloudUserAccount } from 'src/modules/cloud/user/models';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { wrapHttpError } from 'src/common/utils';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudUserApiProvider } from 'src/modules/cloud/user/providers/cloud-user.api.provider';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { CloudSession } from 'src/modules/cloud/session/models/cloud-session';
import { ServerService } from 'src/modules/server/server.service';
import { isValidToken } from './utils';

@Injectable()
export class CloudUserApiService {
  private logger = new Logger('CloudUserApiService');

  constructor(
    private readonly cloudAuthService: CloudAuthService,
    private readonly repository: CloudUserRepository,
    private readonly sessionService: CloudSessionService,
    private readonly api: CloudUserApiProvider,
    private readonly serverService: ServerService,
  ) {}

  /**
   * Find current account in accounts list by currentAccountId
   * @param user
   */
  static getCurrentAccount(user: CloudUser): CloudUserAccount {
    return find(user?.accounts, { id: user?.currentAccountId });
  }

  /**
   * Fetch csrf token if needed
   * @param sessionMetadata
   * @private
   */
  private async ensureCsrf(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      const session = await this.sessionService.getSession(
        sessionMetadata.sessionId,
      );

      if (!session?.csrf) {
        this.logger.debug('Trying to get csrf token', sessionMetadata);
        const csrf = await this.api.getCsrfToken(session);

        if (!csrf) {
          throw new CloudApiUnauthorizedException();
        }

        await this.sessionService.updateSessionData(sessionMetadata.sessionId, {
          csrf,
        });
      }
    } catch (e) {
      this.logger.error('Unable to get csrf token', e, sessionMetadata);
      throw wrapHttpError(e);
    }
  }

  /**
   * Renew jwt tokens if needed
   * @param sessionMetadata
   * @private
   */
  private async ensureAccessToken(
    sessionMetadata: SessionMetadata,
  ): Promise<void> {
    try {
      const session = await this.sessionService.getSession(
        sessionMetadata.sessionId,
      );

      if (!isValidToken(session?.accessToken)) {
        if (!session?.refreshToken) {
          this.logger.error('Refresh token is undefined');
          throw new CloudApiUnauthorizedException();
        }

        await this.cloudAuthService.renewTokens(
          sessionMetadata,
          session?.idpType,
          session?.refreshToken,
        );
      }
    } catch (e) {
      this.logger.error('Error trying renew token', e);
      throw new CloudApiUnauthorizedException(e.message);
    }
  }

  /**
   * Login user to api using accessToken from oauth flow
   * @param sessionMetadata
   * @param utm
   * @private
   */
  private async ensureLogin(
    sessionMetadata: SessionMetadata,
    utm?: CloudRequestUtm,
  ): Promise<void> {
    try {
      await this.ensureAccessToken(sessionMetadata);

      const session = await this.sessionService.getSession(
        sessionMetadata.sessionId,
      );

      if (!session?.apiSessionId) {
        this.logger.debug('Trying to login user', sessionMetadata);

        const preparedUtm = utm && { ...utm };

        if (preparedUtm && (!preparedUtm.amp || !preparedUtm.package)) {
          await this.serverService
            .getInfo(sessionMetadata)
            .then(({ id, packageType }) => {
              preparedUtm.amp = preparedUtm.amp || id;
              preparedUtm.package = preparedUtm.package || packageType;
            })
            .catch(() => {
              this.logger.warn(
                'Unable to get server id for utm parameters',
                sessionMetadata,
              );
            });
        }

        const apiSessionId = await this.api.getApiSessionId(
          session,
          preparedUtm,
        );

        if (!apiSessionId) {
          throw new CloudApiUnauthorizedException();
        }

        await this.sessionService.updateSessionData(sessionMetadata.sessionId, {
          apiSessionId,
        });
      }

      await this.ensureCsrf(sessionMetadata);
    } catch (e) {
      this.logger.error('Unable to login user', e, sessionMetadata);
      throw wrapHttpError(e);
    }
  }

  /**
   * Sync cloud user profile when needed
   * Always sync with force=true
   * @param sessionMetadata
   * @param force
   * @param utm
   * @private
   */
  private async ensureCloudUser(
    sessionMetadata: SessionMetadata,
    force = false,
    utm?: CloudRequestUtm,
  ) {
    try {
      await this.ensureLogin(sessionMetadata, utm);

      const session = await this.sessionService.getSession(
        sessionMetadata.sessionId,
      );

      const existingUser = await this.repository.get(sessionMetadata.sessionId);

      if (existingUser?.id && !force) {
        return;
      }

      this.logger.debug('Trying to sync user profile', sessionMetadata);

      const userData = await this.api.getCurrentUser(session);

      const user: CloudUser = {
        id: +userData.id,
        name: userData.name,
        currentAccountId: +userData.current_account_id,
      };

      const accounts = await this.api.getAccounts(session);

      // todo: remember existing CApi key?
      user.accounts = accounts.map((account) => ({
        id: account.id,
        name: account.name,
        capiKey: account.api_access_key,
      }));

      await this.repository.update(sessionMetadata.sessionId, user);
      this.logger.debug(
        'Successfully synchronized user profile',
        sessionMetadata,
      );
    } catch (e) {
      this.logger.error('Unable to sync user profile', e, sessionMetadata);
      throw wrapHttpError(e);
    }
  }

  /**
   * Get cloud user profile
   * @param sessionMetadata
   * @param forceSync
   * @param utm
   */
  async getCloudUser(
    sessionMetadata: SessionMetadata,
    forceSync = false,
    utm?: CloudRequestUtm,
  ): Promise<CloudUser> {
    try {
      await this.ensureCloudUser(sessionMetadata, forceSync, utm);

      return await this.repository.get(sessionMetadata.sessionId);
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  /**
   * Get cloud user profile
   * @param sessionMetadata
   * @param forceSync
   * @param utm
   */
  async me(
    sessionMetadata: SessionMetadata,
    forceSync = false,
    utm?: CloudRequestUtm,
  ): Promise<CloudUser> {
    return this.api.callWithAuthRetry(sessionMetadata.sessionId, async () =>
      this.getCloudUser(sessionMetadata, forceSync, utm),
    );
  }

  /**
   * Get complete cloud user session
   * @param sessionMetadata
   * @param forceSync
   * @param utm
   */
  async getUserSession(
    sessionMetadata: SessionMetadata,
    forceSync = false,
    utm?: CloudRequestUtm,
  ): Promise<CloudSession> {
    return this.api.callWithAuthRetry(sessionMetadata.sessionId, async () => {
      try {
        await this.ensureCloudUser(sessionMetadata, forceSync, utm);

        return await this.sessionService.getSession(sessionMetadata.sessionId);
      } catch (e) {
        throw wrapHttpError(e);
      }
    });
  }

  /**
   * Invalidate user SM API session
   * @param sessionMetadata
   */
  async invalidateApiSession(sessionMetadata: SessionMetadata): Promise<void> {
    await this.sessionService.invalidateApiSession(sessionMetadata.sessionId);
  }

  /**
   * Select current account to work with
   * @param sessionMetadata
   * @param accountId
   */
  async setCurrentAccount(
    sessionMetadata: SessionMetadata,
    accountId: string | number,
  ): Promise<CloudUser> {
    return this.api.callWithAuthRetry(sessionMetadata.sessionId, async () => {
      try {
        await this.ensureCloudUser(sessionMetadata);

        this.logger.debug('Switching user account', sessionMetadata);

        const session = await this.sessionService.getSession(
          sessionMetadata.sessionId,
        );

        await this.api.setCurrentAccount(session, +accountId);

        return this.getCloudUser(sessionMetadata, true);
      } catch (e) {
        this.logger.error(
          'Unable to switch current account',
          e,
          sessionMetadata,
        );
        throw wrapHttpError(e);
      }
    });
  }

  /**
   * Update user data
   * @param sessionMetadata
   * @param data
   */
  async updateUser(
    sessionMetadata: SessionMetadata,
    data: Partial<CloudUser>,
  ): Promise<CloudUser> {
    return this.repository.update(sessionMetadata.sessionId, data);
  }
}
