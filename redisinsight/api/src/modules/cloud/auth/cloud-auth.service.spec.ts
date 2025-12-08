import axios from 'axios';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import {
  mockCloudAccessTokenNew,
  mockCloudAuthAnalytics,
  mockCloudAuthCode,
  mockCloudAuthGithubAuthUrl,
  mockCloudAuthGithubCallbackQueryObject,
  mockCloudAuthGithubRequest,
  mockCloudAuthGoogleAuthUrl,
  mockCloudAuthGoogleCallbackQueryObject,
  mockCloudAuthGoogleRenewTokenUrl,
  mockCloudAuthGoogleRequest,
  mockCloudAuthGoogleRevokeTokenUrl,
  mockCloudAuthGoogleTokenUrl,
  mockCloudAuthResponse,
  mockCloudRefreshTokenNew,
  mockGithubIdpCloudAuthStrategy,
  mockGoogleIdpCloudAuthStrategy,
  mockSsoIdpCloudAuthStrategy,
  mockTokenResponse,
  mockTokenResponseNew,
} from 'src/__mocks__/cloud-auth';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import {
  mockAxiosBadRequestError,
  mockCloudApiAuthDto,
  mockCloudSessionService,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { GithubIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/github-idp.cloud.auth-strategy';
import { GoogleIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/google-idp.cloud.auth-strategy';
import { CloudAuthAnalytics } from 'src/modules/cloud/auth/cloud-auth.analytics';
import {
  CloudAuthIdpType,
  CloudAuthStatus,
} from 'src/modules/cloud/auth/models';
import {
  CloudOauthMisconfigurationException,
  CloudOauthMissedRequiredDataException,
  CloudOauthUnexpectedErrorException,
  CloudOauthUnknownAuthorizationRequestException,
} from 'src/modules/cloud/auth/exceptions';
import { InternalServerErrorException } from '@nestjs/common';
import { CloudSsoFeatureStrategy } from 'src/modules/cloud/cloud-sso.feature.flag';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { SsoIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/sso-idp.cloud.auth-strategy';
import { CloudOauthSsoUnsupportedEmailException } from 'src/modules/cloud/auth/exceptions/cloud-oauth.sso-unsupported-email.exception';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');

describe('CloudAuthService', () => {
  let service: CloudAuthService;
  let analytics: MockType<CloudAuthAnalytics>;
  let sessionService: MockType<CloudSessionService>;
  let ssoIdpCLoudAuthStrategy: MockType<SsoIdpCloudAuthStrategy>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('axios', () => mockedAxios);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        CloudAuthService,
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
        {
          provide: GithubIdpCloudAuthStrategy,
          useFactory: mockGithubIdpCloudAuthStrategy,
        },
        {
          provide: GoogleIdpCloudAuthStrategy,
          useFactory: mockGoogleIdpCloudAuthStrategy,
        },
        {
          provide: SsoIdpCloudAuthStrategy,
          useFactory: mockSsoIdpCloudAuthStrategy,
        },
        {
          provide: CloudAuthAnalytics,
          useFactory: mockCloudAuthAnalytics,
        },
      ],
    }).compile();

    service = await module.get(CloudAuthService);
    analytics = await module.get(CloudAuthAnalytics);
    sessionService = await module.get(CloudSessionService);
    ssoIdpCLoudAuthStrategy = await module.get(SsoIdpCloudAuthStrategy);
  });

  describe('getAuthStrategy', () => {
    it('should get Google auth strategy', async () => {
      expect(service.getAuthStrategy(CloudAuthIdpType.Google)).toEqual(
        service['googleIdpAuthStrategy'],
      );
    });
    it('should get GitHub auth strategy', async () => {
      expect(service.getAuthStrategy(CloudAuthIdpType.GitHub)).toEqual(
        service['githubIdpCloudAuthStrategy'],
      );
    });
    it('should get Sso auth strategy', async () => {
      expect(service.getAuthStrategy(CloudAuthIdpType.Sso)).toEqual(
        service['ssoIdpCloudAuthStrategy'],
      );
    });
    it('should throw CloudOauthUnknownAuthorizationRequestException error for unsupported strategy', async () => {
      try {
        service.getAuthStrategy('cognito' as CloudAuthIdpType);
      } catch (e) {
        expect(e).toEqual(
          new CloudOauthUnknownAuthorizationRequestException(
            'Unknown cloud auth strategy',
          ),
        );
      }
    });
  });
  describe('getAuthorizationUrl', () => {
    let logoutSpy;

    beforeEach(() => {
      logoutSpy = jest.spyOn(service, 'logout');
    });

    it('should get Google auth url and add auth request to the pool', async () => {
      expect(service['authRequests'].size).toEqual(0);
      expect(
        await service.getAuthorizationUrl(mockSessionMetadata, {
          strategy: CloudAuthIdpType.Google,
        }),
      ).toEqual(mockCloudAuthGoogleAuthUrl);
      expect(logoutSpy).toHaveBeenCalled();
      expect(service['authRequests'].size).toEqual(1);
      expect(
        service['authRequests'].get(mockCloudAuthGoogleRequest.state),
      ).toEqual(mockCloudAuthGoogleRequest);
    });
    it('should get GitHub auth url and add request to the pool but before clear it', async () => {
      service['authRequests'].set(
        mockCloudAuthGoogleRequest.state,
        mockCloudAuthGoogleRequest,
      );
      expect(service['authRequests'].size).toEqual(1);
      expect(
        await service.getAuthorizationUrl(mockSessionMetadata, {
          strategy: CloudAuthIdpType.GitHub,
        }),
      ).toEqual(mockCloudAuthGithubAuthUrl);
      expect(logoutSpy).toHaveBeenCalled();
      expect(service['authRequests'].size).toEqual(1);
      expect(
        service['authRequests'].get(mockCloudAuthGithubRequest.state),
      ).toEqual(mockCloudAuthGithubRequest);
    });
    it('should throw an error if logout failed', async () => {
      sessionService.deleteSessionData.mockRejectedValueOnce(
        new Error('Unable to delete session'),
      );
      service['authRequests'].set(
        mockCloudAuthGoogleRequest.state,
        mockCloudAuthGoogleRequest,
      );
      expect(service['authRequests'].size).toEqual(1);
      await expect(
        service.getAuthorizationUrl(mockSessionMetadata, {
          strategy: CloudAuthIdpType.GitHub,
        }),
      ).rejects.toThrow(CloudOauthMisconfigurationException);
      expect(logoutSpy).toHaveBeenCalled();
      // previous request should stay
      expect(service['authRequests'].size).toEqual(1);
      expect(
        service['authRequests'].get(mockCloudAuthGoogleRequest.state),
      ).toEqual(mockCloudAuthGoogleRequest);
    });
    it('should throw CloudOauthSsoUnsupportedEmailException when no email assign to SAML config', async () => {
      ssoIdpCLoudAuthStrategy.generateAuthRequest.mockRejectedValueOnce(
        new CloudOauthSsoUnsupportedEmailException(),
      );
      service['authRequests'].set(
        mockCloudAuthGoogleRequest.state,
        mockCloudAuthGoogleRequest,
      );
      expect(service['authRequests'].size).toEqual(1);
      await expect(
        service.getAuthorizationUrl(mockSessionMetadata, {
          strategy: CloudAuthIdpType.Sso,
        }),
      ).rejects.toThrow(CloudOauthSsoUnsupportedEmailException);
      expect(logoutSpy).not.toHaveBeenCalled();
      // previous request should stay
      expect(service['authRequests'].size).toEqual(1);
      expect(
        service['authRequests'].get(mockCloudAuthGoogleRequest.state),
      ).toEqual(mockCloudAuthGoogleRequest);
    });
  });
  describe('exchangeCode', () => {
    it('should exchange auth code to access token', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockTokenResponse });
      const url = new URL(mockCloudAuthGoogleTokenUrl);

      expect(
        await service['exchangeCode'](
          mockCloudAuthGoogleRequest,
          mockCloudAuthCode,
        ),
      ).toEqual(mockTokenResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${url.origin}${url.pathname}`,
        url.searchParams,
        {
          headers: {
            accept: 'application/json',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
    });
    it('should throw http error in case of an error', async () => {
      mockedAxios.post.mockRejectedValue(mockAxiosBadRequestError);

      await expect(
        service['exchangeCode'](mockCloudAuthGoogleRequest, mockCloudAuthCode),
      ).rejects.toThrow(InternalServerErrorException); // todo: handle this?
    });
  });
  describe('getAuthRequestInfo', () => {
    it("get only few fields from r0equest and don't remove it", async () => {
      service['authRequests'] = new Map([
        [mockCloudAuthGoogleRequest.state, mockCloudAuthGoogleRequest],
      ]);
      expect(service['authRequests'].size).toEqual(1);
      expect(
        await service['getAuthRequestInfo'](
          mockCloudAuthGoogleCallbackQueryObject,
        ),
      ).toEqual({
        action: mockCloudAuthGoogleRequest.action,
        idpType: mockCloudAuthGoogleRequest.idpType,
        sessionMetadata: mockCloudAuthGoogleRequest.sessionMetadata,
      });
      expect(service['authRequests'].size).toEqual(1);
    });
    it('should throw an error if request not found', async () => {
      service['authRequests'] = new Map([
        [mockCloudAuthGoogleRequest.state, mockCloudAuthGoogleRequest],
      ]);
      expect(service['authRequests'].size).toEqual(1);
      await expect(
        service['getAuthRequestInfo'](mockCloudAuthGithubCallbackQueryObject),
      ).rejects.toThrow(CloudOauthUnknownAuthorizationRequestException);
    });
  });
  describe('callback', () => {
    let spy;

    beforeEach(() => {
      service['authRequests'] = new Map([
        [mockCloudAuthGoogleRequest.state, mockCloudAuthGoogleRequest],
      ]);
      spy = jest.spyOn(service as any, 'exchangeCode');
      spy.mockResolvedValue(mockTokenResponse);
    });

    it('should exchange code and remove auth request from the pool', async () => {
      expect(service['authRequests'].size).toEqual(1);
      expect(
        await service['callback'](mockCloudAuthGoogleCallbackQueryObject),
      ).toEqual(mockCloudAuthGoogleRequest.callback);
      expect(spy).toHaveBeenCalledWith(
        mockCloudAuthGoogleRequest,
        mockCloudAuthGoogleCallbackQueryObject.code,
      );
      expect(service['authRequests'].size).toEqual(0);
    });
    it('should store idToken in session when present in token response', async () => {
      expect(service['authRequests'].size).toEqual(1);
      await service['callback'](mockCloudAuthGoogleCallbackQueryObject);
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockCloudAuthGoogleRequest.sessionMetadata.sessionId,
        {
          accessToken: mockTokenResponse.access_token,
          refreshToken: mockTokenResponse.refresh_token,
          idToken: mockTokenResponse.id_token,
          idpType: mockCloudAuthGoogleRequest.idpType,
        },
      );
    });
    it('should handle missing idToken gracefully', async () => {
      const tokenResponseWithoutIdToken = {
        access_token: mockCloudAccessTokenNew,
        refresh_token: mockCloudRefreshTokenNew,
      };
      spy.mockResolvedValue(tokenResponseWithoutIdToken);
      expect(service['authRequests'].size).toEqual(1);
      await service['callback'](mockCloudAuthGoogleCallbackQueryObject);
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockCloudAuthGoogleRequest.sessionMetadata.sessionId,
        {
          accessToken: tokenResponseWithoutIdToken.access_token,
          refreshToken: tokenResponseWithoutIdToken.refresh_token,
          idToken: undefined,
          idpType: mockCloudAuthGoogleRequest.idpType,
        },
      );
    });
    it('should throw an error if error field in query parameters (CloudOauthMisconfigurationException)', async () => {
      expect(service['authRequests'].size).toEqual(1);
      await expect(
        service['callback']({
          ...mockCloudAuthGoogleCallbackQueryObject,
          error: 'bad request',
          error_description: 'some unknown error message',
        }),
      ).rejects.toThrow(CloudOauthUnexpectedErrorException);
    });
    it('should throw an error if error field in query parameters (CloudOauthMissedRequiredDataException)', async () => {
      expect(service['authRequests'].size).toEqual(1);
      await expect(
        service['callback']({
          ...mockCloudAuthGoogleCallbackQueryObject,
          error: 'access_denied',
          error_description:
            'Some required properties are missing: email and lastName',
        }),
      ).rejects.toThrow(
        new CloudOauthMissedRequiredDataException(
          'Some required properties are missing: email and lastName',
        ),
      );
    });
    it('should throw an error if request not found', async () => {
      expect(service['authRequests'].size).toEqual(1);
      await expect(
        service['callback'](mockCloudAuthGithubCallbackQueryObject),
      ).rejects.toThrow(CloudOauthUnknownAuthorizationRequestException);
    });
  });
  describe('revokeRefreshToken', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'exchangeCode');
      spy.mockResolvedValue(mockTokenResponse);
    });

    it('should revoke refresh token', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: undefined });
      const url = new URL(mockCloudAuthGoogleRevokeTokenUrl);

      expect(await service['revokeRefreshToken'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${url.origin}${url.pathname}`,
        url.searchParams,
        {
          headers: {
            accept: 'application/json',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
    });

    it('should not fail and should not make a http call when there is no refreshToken', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      expect(await service['revokeRefreshToken'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should not fail in case of an any error', async () => {
      sessionService.getSession.mockRejectedValueOnce(new Error());

      expect(await service['revokeRefreshToken'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
  describe('renewTokens', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'exchangeCode');
      spy.mockResolvedValue(mockTokenResponse);
    });

    it('should renew tokens', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockTokenResponseNew });
      const url = new URL(mockCloudAuthGoogleRenewTokenUrl);

      expect(
        await service['renewTokens'](
          mockSessionMetadata,
          mockCloudApiAuthDto.idpType,
          mockCloudApiAuthDto.refreshToken,
        ),
      ).toEqual(undefined);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${url.origin}${url.pathname}`,
        url.searchParams,
        {
          headers: {
            accept: 'application/json',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        {
          accessToken: mockCloudAccessTokenNew,
          refreshToken: mockCloudRefreshTokenNew,
          idpType: mockCloudApiAuthDto.idpType,
          csrf: null,
          apiSessionId: null,
        },
      );
    });

    it('should throw CloudApiUnauthorizedException in case of an any error', async () => {
      sessionService.getSession.mockRejectedValueOnce(new Error());

      await expect(
        service['renewTokens'](
          mockSessionMetadata,
          mockCloudApiAuthDto.idpType,
          mockCloudApiAuthDto.refreshToken,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
  describe('handleCallback', () => {
    let spy;
    let callback;

    beforeEach(() => {
      service['authRequests'] = new Map([
        [mockCloudAuthGoogleRequest.state, mockCloudAuthGoogleRequest],
      ]);
      spy = jest.spyOn(service as any, 'callback');
      callback = jest.fn();
      spy.mockResolvedValue(callback);
    });

    it('should successfully handle auth callback', async () => {
      expect(
        await service['handleCallback'](mockCloudAuthGoogleCallbackQueryObject),
      ).toEqual(mockCloudAuthResponse);
      expect(callback).toHaveBeenCalledWith(mockCloudAuthResponse);
      expect(analytics.sendCloudSignInSucceeded).toHaveBeenCalledWith(
        mockSessionMetadata,
        CloudSsoFeatureStrategy.DeepLink,
        mockCloudAuthGoogleRequest.action,
      );
    });
    it('should not fail if async callback failed', async () => {
      callback.mockRejectedValueOnce(new Error('some error'));
      expect(
        await service['handleCallback'](mockCloudAuthGoogleCallbackQueryObject),
      ).toEqual(mockCloudAuthResponse);
      expect(callback).toHaveBeenCalledWith(mockCloudAuthResponse);
    });
    it('should not fail if sync callback failed', async () => {
      callback.mockImplementationOnce(() => {
        throw new Error('some error');
      });
      expect(
        await service['handleCallback'](mockCloudAuthGoogleCallbackQueryObject),
      ).toEqual(mockCloudAuthResponse);
      expect(callback).toHaveBeenCalledWith(mockCloudAuthResponse);
    });

    it('should response with an error and call callback', async () => {
      const error = new CloudOauthUnknownAuthorizationRequestException();
      const errorResponse = {
        status: CloudAuthStatus.Failed,
        error: error.getResponse(),
      };

      spy.mockRejectedValueOnce(error);
      expect(
        await service['handleCallback'](mockCloudAuthGoogleCallbackQueryObject),
      ).toEqual(errorResponse);
      expect(callback).not.toHaveBeenCalled();
      expect(analytics.sendCloudSignInFailed).toHaveBeenCalledWith(
        mockSessionMetadata,
        error,
        CloudSsoFeatureStrategy.DeepLink,
        mockCloudAuthGoogleRequest.action,
      );
    });
  });
});
