const { PublicClientApplication, CryptoProvider } = require('@azure/msal-node');
import { Logger } from '@nestjs/common';
import config from 'src/utils/config';
import { CloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/cloud-auth.strategy';
import {
  CloudAuthIdpType,
  CloudAuthRequest,
  CloudAuthRequestOptions,
} from 'src/modules/cloud/auth/models/cloud-auth-request';
import { SessionMetadata } from 'src/common/models';
import { plainToClass } from 'class-transformer';

const {
  idp: { microsoft: idpConfig },
} = config.get('cloud');

export class MicrosoftIdpCloudAuthStrategy extends CloudAuthStrategy {
  private logger = new Logger('MicrosoftIdpCloudAuthStrategy');
  private cryptoProvider: typeof CryptoProvider;
  private msalClient: typeof PublicClientApplication;

  constructor() {
    super();

    this.cryptoProvider = new CryptoProvider();
    this.msalClient = new PublicClientApplication({
      auth: {
        clientId: idpConfig.clientId,
        authority: idpConfig.authority,
      },
    });

    this.config = {
      idpType: CloudAuthIdpType.Microsoft,
      authorizeUrl: `${idpConfig.authority}/oauth2/v2.0/authorize`,
      tokenUrl: `${idpConfig.authority}/oauth2/v2.0/token`,
      revokeTokenUrl: `${idpConfig.authority}/oauth2/v2.0/logout`,
      clientId: idpConfig.clientId,
      pkce: true,
      redirectUri: idpConfig.redirectUri,
      scopes: ['offline_access', 'openid', 'email', 'profile'],
      responseMode: 'query',
      responseType: 'code',
    };
  }

  async generateAuthRequest(
    sessionMetadata: SessionMetadata,
    options?: CloudAuthRequestOptions,
  ): Promise<CloudAuthRequest> {
    const { verifier, challenge } =
      await this.cryptoProvider.generatePkceCodes();

    const state = this.cryptoProvider.createNewGuid();
    const nonce = this.cryptoProvider.createNewGuid();

    return plainToClass(CloudAuthRequest, {
      ...this.config,
      state,
      nonce,
      codeVerifier: verifier,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      sessionMetadata,
      createdAt: new Date(),
    });
  }
}
