import {
  CloudAuthIdpType,
  CloudAuthRequest,
  CloudAuthResponse,
  CloudAuthStatus,
} from 'src/modules/cloud/auth/models';
import { mockSessionMetadata } from 'src/__mocks__/common';

export const mockCloudAuthCode = 'ac_p6vA6A5tF36Jf6twH2cBOqtt7n';
export const mockCloudAccessToken = 'at_p6vA6A5tF36Jf6twH2cBOqtt7n';
export const mockCloudRefreshToken = 'rt_p6vA6A5tF36Jf6twH2cBOqtt7n';
export const mockCloudAccessTokenNew = 'at_p6vA6A5tF36Jf6twH2cBOqtt7n-new';
export const mockCloudRefreshTokenNew = 'rt_p6vA6A5tF36Jf6twH2cBOqtt7n-new';
export const mockCloudRevokeRefreshTokenHint = 'refresh_token';

export const mockCloudAuthGoogleIdpConfig = {
  idpType: 'google',
  authorizeUrl: 'oauth2/authorize',
  tokenUrl: 'oauth2/token',
  revokeTokenUrl: 'oauth2/revoke',
  issuer: 'https://authorization.server.com',
  clientId: 'cid_p6vA6A5tF36Jf6twH2cBOqtt7n',
  pkce: true,
  redirectUri: 'redisinsight:/cloud/oauth/callback',
  idp: 'idp_p6vA6A5tF36Jf6twH2cBOqtt7n',
  scopes: ['offline_access', 'openid', 'email', 'profile'],
  responseMode: 'query',
  responseType: 'code',
};

export const mockCloudAuthGithubIdpConfig = {
  idpType: 'github',
};

export const mockCloudAuthGoogleTokenParams = {
  ...mockCloudAuthGoogleIdpConfig,
  state: 'state_p6vA6A5tF36Jf6twH2cBOqtt7n',
  nonce: 'nonce_p6vA6A5tF36Jf6twH2cBOqtt7n',
  ignoreSignature: false,
  codeVerifier: 'cv_p6vA6A5tF36Jf6twH2cBOqtt7n',
  codeChallenge: 'cch_p6vA6A5tF36Jf6twH2cBOqtt7n',
  codeChallengeMethod: 'S256',
};

export const mockCloudAuthGithubTokenParams = {
  ...mockCloudAuthGoogleTokenParams,
  state: 'state_p6vA6A5tF36Jf6twH2cBOqtt7ngn',
  idpType: 'github',
};

export const mockCloudAuthSsoTokenParams = {
  ...mockCloudAuthGoogleTokenParams,
  state: 'state_p6vA6A5tF36Jf6twH2cBOqtt7ssp',
  idpType: 'sso',
};

export const mockCloudAuthGoogleRequest = Object.assign(
  new CloudAuthRequest(),
  {
    ...mockCloudAuthGoogleTokenParams,
    sessionMetadata: {
      ...mockSessionMetadata,
    },
    tokenManager: { storage: {} },
    createdAt: new Date(),
  },
);

export const mockCloudAuthSsoRequest = Object.assign(new CloudAuthRequest(), {
  ...mockCloudAuthGoogleRequest,
  ...mockCloudAuthSsoTokenParams,
  tokenManager: { storage: {} },
  createdAt: new Date(),
  idpType: CloudAuthIdpType.Sso,
  idp: 'idp_p6vA6A5tF36Jf6twH2cBOqtSSO',
});

export const mockCloudAuthGoogleAuthUrl =
  `${mockCloudAuthGoogleRequest.issuer}` +
  `/${mockCloudAuthGoogleRequest.authorizeUrl}` +
  `?client_id=${mockCloudAuthGoogleRequest.clientId}` +
  `&${new URLSearchParams({ redirect_uri: mockCloudAuthGoogleRequest.redirectUri }).toString()}` +
  `&response_type=${mockCloudAuthGoogleRequest.responseType}` +
  `&response_mode=${mockCloudAuthGoogleRequest.responseMode}` +
  `&idp=${mockCloudAuthGoogleRequest.idp}` +
  `&state=${mockCloudAuthGoogleRequest.state}` +
  `&nonce=${mockCloudAuthGoogleRequest.nonce}` +
  `&code_challenge_method=${mockCloudAuthGoogleRequest.codeChallengeMethod}` +
  `&code_challenge=${mockCloudAuthGoogleRequest.codeChallenge}` +
  `&${new URLSearchParams({ scope: mockCloudAuthGoogleRequest.scopes.join(' ') }).toString()}` +
  '&prompt=login';

export const mockCloudAuthSsoAuthUrl =
  `${mockCloudAuthSsoRequest.issuer}` +
  `/${mockCloudAuthSsoRequest.authorizeUrl}` +
  `?client_id=${mockCloudAuthSsoRequest.clientId}` +
  `&${new URLSearchParams({ redirect_uri: mockCloudAuthSsoRequest.redirectUri }).toString()}` +
  `&response_type=${mockCloudAuthSsoRequest.responseType}` +
  `&response_mode=${mockCloudAuthSsoRequest.responseMode}` +
  `&idp=${mockCloudAuthSsoRequest.idp}` +
  `&state=${mockCloudAuthSsoRequest.state}` +
  `&nonce=${mockCloudAuthSsoRequest.nonce}` +
  `&code_challenge_method=${mockCloudAuthSsoRequest.codeChallengeMethod}` +
  `&code_challenge=${mockCloudAuthSsoRequest.codeChallenge}` +
  `&${new URLSearchParams({ scope: mockCloudAuthSsoRequest.scopes.join(' ') }).toString()}` +
  '&prompt=login';

export const mockCloudAuthGoogleTokenUrl =
  `${mockCloudAuthGoogleRequest.issuer}` +
  `/${mockCloudAuthGoogleRequest.tokenUrl}` +
  `?client_id=${mockCloudAuthGoogleRequest.clientId}` +
  '&grant_type=authorization_code' +
  `&code=${mockCloudAuthCode}` +
  `&code_verifier=${mockCloudAuthGoogleRequest.codeVerifier}` +
  `&${new URLSearchParams({ redirect_uri: mockCloudAuthGoogleRequest.redirectUri }).toString()}` +
  `&state=${mockCloudAuthGoogleRequest.state}` +
  `&nonce=${mockCloudAuthGoogleRequest.nonce}` +
  `&idp=${mockCloudAuthGoogleRequest.idp}`;

export const mockCloudAuthGoogleRevokeTokenUrl =
  `${mockCloudAuthGoogleRequest.issuer}` +
  `/${mockCloudAuthGoogleIdpConfig.revokeTokenUrl}` +
  `?client_id=${mockCloudAuthGoogleRequest.clientId}` +
  `&token_type_hint=${mockCloudRevokeRefreshTokenHint}` +
  `&token=${mockCloudRefreshToken}`;

export const mockCloudAuthSsoRevokeTokenUrl =
  `${mockCloudAuthSsoRequest.issuer}` +
  `/${mockCloudAuthGoogleIdpConfig.revokeTokenUrl}` +
  `?client_id=${mockCloudAuthSsoRequest.clientId}` +
  `&token_type_hint=${mockCloudRevokeRefreshTokenHint}` +
  `&token=${mockCloudRefreshToken}`;

export const mockCloudAuthGoogleRenewTokenUrl =
  `${mockCloudAuthGoogleRequest.issuer}` +
  `/${mockCloudAuthGoogleIdpConfig.tokenUrl}` +
  `?client_id=${mockCloudAuthGoogleRequest.clientId}` +
  '&grant_type=refresh_token' +
  `&${new URLSearchParams({ redirect_uri: mockCloudAuthGoogleRequest.redirectUri }).toString()}` +
  `&${new URLSearchParams({ scope: mockCloudAuthGoogleRequest.scopes.join(' ') }).toString()}` +
  `&refresh_token=${mockCloudRefreshToken}`;

export const mockCloudAuthSsoRenewTokenUrl =
  `${mockCloudAuthSsoRequest.issuer}` +
  `/${mockCloudAuthGoogleIdpConfig.tokenUrl}` +
  `?client_id=${mockCloudAuthSsoRequest.clientId}` +
  '&grant_type=refresh_token' +
  `&${new URLSearchParams({ redirect_uri: mockCloudAuthSsoRequest.redirectUri }).toString()}` +
  `&${new URLSearchParams({ scope: mockCloudAuthSsoRequest.scopes.join(' ') }).toString()}` +
  `&refresh_token=${mockCloudRefreshToken}`;

export const mockCloudAuthGithubRequest = Object.assign(
  new CloudAuthRequest(),
  {
    ...mockCloudAuthGithubTokenParams,
    sessionMetadata: {
      ...mockSessionMetadata,
    },
    tokenManager: { storage: {} },
    createdAt: new Date(),
  },
);

export const mockCloudAuthGithubAuthUrl =
  `${mockCloudAuthGithubRequest.issuer}` +
  `/${mockCloudAuthGithubRequest.authorizeUrl}` +
  `?client_id=${mockCloudAuthGithubRequest.clientId}` +
  `&${new URLSearchParams({ redirect_uri: mockCloudAuthGithubRequest.redirectUri }).toString()}` +
  `&response_type=${mockCloudAuthGithubRequest.responseType}` +
  `&response_mode=${mockCloudAuthGithubRequest.responseMode}` +
  `&idp=${mockCloudAuthGithubRequest.idp}` +
  `&state=${mockCloudAuthGithubRequest.state}` +
  `&nonce=${mockCloudAuthGithubRequest.nonce}` +
  `&code_challenge_method=${mockCloudAuthGithubRequest.codeChallengeMethod}` +
  `&code_challenge=${mockCloudAuthGithubRequest.codeChallenge}` +
  `&${new URLSearchParams({ scope: mockCloudAuthGithubRequest.scopes.join(' ') }).toString()}` +
  '&prompt=login';

export const mockCloudIdToken = 'id_token_p6vA6A5tF36Jf6twH2cBOqtt7n';
export const mockCloudIdTokenNew = 'id_token_p6vA6A5tF36Jf6twH2cBOqtt7n-new';

export const mockTokenResponse = {
  access_token: mockCloudAccessToken,
  refresh_token: mockCloudRefreshToken,
  id_token: mockCloudIdToken,
};

export const mockTokenResponseNew = {
  access_token: mockCloudAccessTokenNew,
  refresh_token: mockCloudRefreshTokenNew,
  id_token: mockCloudIdTokenNew,
};

export const mockCloudAuthGoogleCallbackQueryObject = {
  state: mockCloudAuthGoogleTokenParams.state,
  code: mockCloudAuthCode,
};

export const mockCloudAuthGithubCallbackQueryObject = {
  state: mockCloudAuthGithubTokenParams.state,
  code: mockCloudAuthCode,
};

export const mockCloudAuthResponse = Object.assign(new CloudAuthResponse(), {
  status: CloudAuthStatus.Succeed,
  message: 'Successfully authenticated',
});

export const mockCloudAuthFailedResponse = Object.assign(
  new CloudAuthResponse(),
  {
    status: CloudAuthStatus.Failed,
    message: 'Successfully authenticated',
  },
);

export const mockOktaAuthClient = {
  token: {
    prepareTokenParams: jest
      .fn()
      .mockResolvedValue(mockCloudAuthGoogleTokenParams),
  },
};

export const mockGithubIdpCloudAuthStrategy = jest.fn(() => ({
  generateAuthRequest: jest.fn().mockResolvedValue(mockCloudAuthGithubRequest),
}));

export const mockGoogleIdpCloudAuthStrategy = jest.fn(() => ({
  generateAuthRequest: jest.fn().mockResolvedValue(mockCloudAuthGoogleRequest),
  generateRevokeTokensUrl: jest
    .fn()
    .mockReturnValue(new URL(mockCloudAuthGoogleRevokeTokenUrl)),
  generateRenewTokensUrl: jest
    .fn()
    .mockReturnValue(new URL(mockCloudAuthGoogleRenewTokenUrl)),
}));

export const mockSsoIdpCloudAuthStrategy = jest.fn(() => ({
  generateAuthRequest: jest.fn().mockResolvedValue(mockCloudAuthSsoRequest),
  generateRevokeTokensUrl: jest
    .fn()
    .mockReturnValue(new URL(mockCloudAuthSsoRevokeTokenUrl)),
  generateRenewTokensUrl: jest
    .fn()
    .mockReturnValue(new URL(mockCloudAuthSsoRenewTokenUrl)),
}));

export const mockCloudAuthService = jest.fn(() => ({
  renewTokens: jest.fn().mockResolvedValue(undefined),
}));

export const mockCloudAuthAnalytics = jest.fn(() => ({
  sendCloudSignInSucceeded: jest.fn(),
  sendCloudSignInFailed: jest.fn(),
}));
