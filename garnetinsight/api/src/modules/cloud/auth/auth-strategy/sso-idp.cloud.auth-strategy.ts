import { OktaAuth, SimpleStorage } from '@okta/okta-auth-js';
import config from 'src/utils/config';
import { CloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/cloud-auth.strategy';
import {
  CloudAuthIdpType,
  CloudAuthRequest,
  CloudAuthRequestOptions,
} from 'src/modules/cloud/auth/models/cloud-auth-request';
import { SessionMetadata } from 'src/common/models';
import { plainToInstance } from 'class-transformer';
import axios from 'axios';
import * as path from 'path';
import { CloudOauthSsoUnsupportedEmailException } from 'src/modules/cloud/auth/exceptions/cloud-oauth.sso-unsupported-email.exception';
import { Logger } from '@nestjs/common';

const {
  idp: { sso: idpConfig },
} = config.get('cloud');
const cloudConfig = config.get('cloud');

export class SsoIdpCloudAuthStrategy extends CloudAuthStrategy {
  private logger = new Logger('SsoIdpCloudAuthStrategy');

  constructor() {
    super();

    this.config = {
      idpType: CloudAuthIdpType.Sso,
      authorizeUrl: idpConfig.authorizeUrl,
      tokenUrl: idpConfig.tokenUrl,
      revokeTokenUrl: idpConfig.revokeTokenUrl,
      issuer: idpConfig.issuer,
      clientId: idpConfig.clientId,
      pkce: true,
      redirectUri: idpConfig.redirectUri,
      idp: idpConfig.idp,
      scopes: ['offline_access', 'openid', 'email', 'profile'],
      responseMode: 'query',
      responseType: 'code',
      tokenManager: {
        storage: {} as SimpleStorage,
      },
    };
  }

  private async determineIdp(email: string) {
    try {
      const apiUrl = new URL(
        path.posix.join(cloudConfig.apiUrl, idpConfig.emailVerificationUri),
      );
      apiUrl.searchParams.set('email', email);
      const { data: idp } = await axios.get(apiUrl.toString());

      return idp;
    } catch (e) {
      this.logger.error('Unable to get idp by email', e);
      throw new CloudOauthSsoUnsupportedEmailException();
    }
  }

  /**
   * Create and store auth request params
   */
  async generateAuthRequest(
    sessionMetadata: SessionMetadata,
    options?: CloudAuthRequestOptions,
  ): Promise<CloudAuthRequest> {
    const idp = await this.determineIdp(options?.data?.email);
    const authClient = new OktaAuth(this.config);
    const tokenParams = await authClient.token.prepareTokenParams(this.config);

    return plainToInstance(CloudAuthRequest, {
      ...this.config,
      ...tokenParams,
      idp,
      sessionMetadata,
      createdAt: new Date(),
    });
  }
}
