import { Test, TestingModule } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
import {
  mockCloudApiAuthDto,
  mockCloudSessionService,
  mockCloudUserRepository,
  mockSessionMetadata,
  mockCloudUser,
  MockType,
  mockCapiUnauthorizedError,
  mockCloudSession,
  mockCloudCapiAccount,
  mockCloudApiUser,
  mockCloudApiCsrfToken,
  mockServerService,
  mockCloudRequestUtm,
  mockCompleteCloudUtm,
  mockUtmCompleteBody,
  mockUtmBody,
} from 'src/__mocks__';
import { when, resetAllWhenMocks } from 'jest-when';
import {
  CloudApiInternalServerErrorException,
  CloudApiUnauthorizedException,
} from 'src/modules/cloud/common/exceptions';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudUserApiProvider } from 'src/modules/cloud/user/providers/cloud-user.api.provider';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { mockCloudAuthService } from 'src/__mocks__/cloud-auth';
import axios from 'axios';
import { ServerService } from 'src/modules/server/server.service';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudUserApiService', () => {
  let service: CloudUserApiService;
  let repository: MockType<CloudUserRepository>;
  let sessionService: MockType<CloudSessionService>;
  let authService: MockType<CloudAuthService>;
  let serverService: MockType<ServerService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    resetAllWhenMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudUserApiService,
        CloudUserApiProvider,
        {
          provide: CloudUserRepository,
          useFactory: mockCloudUserRepository,
        },
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
        {
          provide: CloudAuthService,
          useFactory: mockCloudAuthService,
        },
        {
          provide: ServerService,
          useFactory: mockServerService,
        },
      ],
    }).compile();

    service = module.get(CloudUserApiService);
    repository = module.get(CloudUserRepository);
    sessionService = module.get(CloudSessionService);
    authService = module.get(CloudAuthService);
    serverService = module.get(ServerService);
  });

  describe('ensureCsrf', () => {
    beforeEach(async () => {
      when(mockedAxios.get)
        .calledWith('csrf', expect.anything())
        .mockResolvedValue({
          status: 200,
          data: { csrfToken: mockCloudApiCsrfToken },
        });
    });

    it('should pass when there is existing csrf', async () => {
      expect(await service['ensureCsrf'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).not.toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(0);
    });
    it('should get csrf when no csrf in the session', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      expect(await service['ensureCsrf'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        {
          csrf: mockCloudApiAuthDto.csrf,
        },
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        'csrf',
        expect.anything(),
      );
    });
    it('should throw unauthorized error when no csrf returned', async () => {
      when(mockedAxios.get)
        .calledWith('csrf', expect.anything())
        .mockResolvedValue({
          status: 200,
          data: { different: mockCloudApiCsrfToken },
        });
      sessionService.getSession.mockResolvedValueOnce(null);

      await expect(
        service['ensureCsrf'](mockSessionMetadata),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).not.toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        'csrf',
        expect.anything(),
      );
    });
    it('should throw unauthorized error when fetching api call returned 401', async () => {
      when(mockedAxios.get)
        .calledWith('csrf', expect.anything())
        .mockRejectedValueOnce(mockCapiUnauthorizedError);
      sessionService.getSession.mockResolvedValueOnce(null);

      await expect(
        service['ensureCsrf'](mockSessionMetadata),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).not.toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        'csrf',
        expect.anything(),
      );
    });
  });

  describe('ensureAccessToken', () => {
    it('Should not renew when access token is not expired', async () => {
      const mockedAccessToken = sign(
        { exp: Math.trunc(Date.now() / 1000) + 3600 },
        'test',
      );
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).not.toHaveBeenCalled();
    });
    it('Should not renew when access token is not expired and 3m until expiration time', async () => {
      const mockedAccessToken = sign(
        { exp: Math.trunc(Date.now() / 1000) + 180 },
        'test',
      );
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).not.toHaveBeenCalled();
    });
    it('Should renew tokens when access token is expired', async () => {
      const mockedAccessToken = sign(
        { exp: Math.trunc(Date.now() / 1000) - 3600 },
        'test',
      );
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCloudApiAuthDto.idpType,
        mockCloudApiAuthDto.refreshToken,
      );
    });
    it('Should renew tokens when access token is not expired but < 2m until exp time', async () => {
      const mockedAccessToken = sign(
        { exp: Math.trunc(Date.now() / 1000) + 100 },
        'test',
      );
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCloudApiAuthDto.idpType,
        mockCloudApiAuthDto.refreshToken,
      );
    });
    it('Should throw CloudApiUnauthorizedException in case of any error', async () => {
      authService.renewTokens.mockRejectedValueOnce(new Error());

      const mockedAccessToken = sign(
        { exp: Math.trunc(Date.now() / 1000) },
        'test',
      );
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });

      await expect(
        service['ensureAccessToken'](mockSessionMetadata),
      ).rejects.toThrow(CloudApiUnauthorizedException);
      expect(authService.renewTokens).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCloudApiAuthDto.idpType,
        mockCloudApiAuthDto.refreshToken,
      );
    });
    it('Should throw CloudApiUnauthorizedException error if there is no session', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      await expect(
        service['ensureAccessToken'](mockSessionMetadata),
      ).rejects.toThrow(CloudApiUnauthorizedException);
      expect(authService.renewTokens).not.toHaveBeenCalled();
    });
  });

  describe('ensureLogin', () => {
    let spyEnsureAccessToken;
    let spyEnsureCsrf;

    beforeEach(async () => {
      spyEnsureAccessToken = jest.spyOn(service as any, 'ensureAccessToken');
      spyEnsureAccessToken.mockResolvedValue(undefined);
      spyEnsureCsrf = jest.spyOn(service as any, 'ensureCsrf');
      spyEnsureCsrf.mockResolvedValue(undefined);
      when(mockedAxios.post)
        .calledWith('login', expect.anything(), expect.anything())
        .mockResolvedValue({
          status: 200,
          headers: {
            'set-cookie': [
              `anything;JSESSIONID=${mockCloudApiAuthDto.apiSessionId};anything;`,
            ],
          },
        });
    });

    it('should pass when there is existing user in session', async () => {
      expect(await service['ensureLogin'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(1);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).not.toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledTimes(0);
    });
    it('should login and get csrf when no apiSessionId (should ignore utm)', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      expect(await service['ensureLogin'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(1);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        {
          apiSessionId: mockCloudApiAuthDto.apiSessionId,
        },
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'login',
        {},
        expect.anything(),
      );
    });
    it('should login and get csrf when no apiSessionId and use passed utm parameters', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      expect(
        await service['ensureLogin'](mockSessionMetadata, mockCompleteCloudUtm),
      ).toEqual(undefined);
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(1);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        {
          apiSessionId: mockCloudApiAuthDto.apiSessionId,
        },
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'login',
        mockUtmCompleteBody,
        expect.anything(),
      );
      expect(serverService.getInfo).not.toHaveBeenCalled();
    });
    it('should login and get csrf when no apiSessionId and calculate additional utm parameters', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      expect(
        await service['ensureLogin'](mockSessionMetadata, mockCloudRequestUtm),
      ).toEqual(undefined);
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(1);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        {
          apiSessionId: mockCloudApiAuthDto.apiSessionId,
        },
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'login',
        mockUtmCompleteBody,
        expect.anything(),
      );
      expect(serverService.getInfo).toHaveBeenCalledWith(mockSessionMetadata);
    });
    it('should login and get csrf when no apiSessionId and not fail when calculating utm caused an error', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);
      serverService.getInfo.mockRejectedValueOnce(new Error());

      expect(
        await service['ensureLogin'](mockSessionMetadata, mockCloudRequestUtm),
      ).toEqual(undefined);
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(1);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        {
          apiSessionId: mockCloudApiAuthDto.apiSessionId,
        },
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'login',
        mockUtmBody,
        expect.anything(),
      );
      expect(serverService.getInfo).toHaveBeenCalledWith(mockSessionMetadata);
    });
    it('should login and get csrf when no apiSessionId login should be sent with "auth_mode"', async () => {
      sessionService.getSession.mockResolvedValueOnce({
        idpType: CloudAuthIdpType.Sso,
      });

      expect(await service['ensureLogin'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(1);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        {
          apiSessionId: mockCloudApiAuthDto.apiSessionId,
        },
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'login',
        expect.objectContaining({
          auth_mode: CloudAuthIdpType.Sso,
        }),
        expect.anything(),
      );
    });
    it('should throw unauthorized error when no session id successfully fetched', async () => {
      when(mockedAxios.post)
        .calledWith('login', expect.anything(), expect.anything())
        .mockResolvedValue({
          status: 200,
          headers: { 'set-cookie': ['anything;anything;'] },
        });
      sessionService.getSession.mockResolvedValueOnce(null);

      await expect(
        service['ensureLogin'](mockSessionMetadata),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(0);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).not.toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'login',
        expect.anything(),
        expect.anything(),
      );
    });
    it('should throw unauthorized error when no fetching api call returns 401', async () => {
      when(mockedAxios.post)
        .calledWith('login', expect.anything(), expect.anything())
        .mockRejectedValueOnce(mockCapiUnauthorizedError);
      sessionService.getSession.mockResolvedValueOnce(null);

      await expect(
        service['ensureLogin'](mockSessionMetadata),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(spyEnsureAccessToken).toHaveBeenCalledTimes(1);
      expect(spyEnsureCsrf).toHaveBeenCalledTimes(0);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.updateSessionData).not.toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'login',
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('ensureCloudUser', () => {
    let spy;

    beforeEach(async () => {
      spy = jest.spyOn(service as any, 'ensureLogin');
      spy.mockResolvedValue(undefined);
      when(mockedAxios.get)
        .calledWith('/users/me', expect.anything())
        .mockResolvedValue({
          status: 200,
          data: mockCloudApiUser,
        });
      when(mockedAxios.get)
        .calledWith('/accounts', expect.anything())
        .mockResolvedValue({
          status: 200,
          data: { accounts: [mockCloudCapiAccount] },
        });
    });

    it('should pass when there is existing user in session', async () => {
      expect(await service['ensureCloudUser'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(repository.get).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(0);
    });
    it('should fetch user when force flag submitted', async () => {
      expect(
        await service['ensureCloudUser'](mockSessionMetadata, true),
      ).toEqual(undefined);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(repository.get).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        '/users/me',
        expect.anything(),
      );
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        '/accounts',
        expect.anything(),
      );
    });
    it('should fetch user when there is no user in the repo', async () => {
      repository.get.mockResolvedValue(null);
      expect(await service['ensureCloudUser'](mockSessionMetadata)).toEqual(
        undefined,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(repository.get).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        '/users/me',
        expect.anything(),
      );
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        '/accounts',
        expect.anything(),
      );
    });
    it('should wrap Unauthorized error when /user/me returned 401 status code', async () => {
      when(mockedAxios.get)
        .calledWith('/users/me', expect.anything())
        .mockRejectedValueOnce(mockCapiUnauthorizedError);

      await expect(
        service['ensureCloudUser'](mockSessionMetadata, true),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        '/users/me',
        expect.anything(),
      );
    });
    it('should wrap Unauthorized error when /accounts returned 401 status code', async () => {
      when(mockedAxios.get)
        .calledWith('/accounts', expect.anything())
        .mockRejectedValueOnce(mockCapiUnauthorizedError);

      await expect(
        service['ensureCloudUser'](mockSessionMetadata, true),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        '/users/me',
        expect.anything(),
      );
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        '/accounts',
        expect.anything(),
      );
    });
  });

  describe('me', () => {
    let spy;

    beforeEach(async () => {
      spy = jest.spyOn(service as any, 'ensureCloudUser');
      spy.mockResolvedValue(undefined);
    });

    it('should get user profile', async () => {
      expect(await service.me(mockSessionMetadata)).toEqual(mockCloudUser);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(repository.get).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
    });
    it('should get user profile from 2nd attempt', async () => {
      spy.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      spy.mockResolvedValueOnce(undefined);

      expect(await service.me(mockSessionMetadata)).toEqual(mockCloudUser);
      expect(spy).toHaveBeenCalledTimes(2);
    });
    it('should throw an error if retries attempts exceeded', async () => {
      spy.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      spy.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.me(mockSessionMetadata)).rejects.toEqual(
        new CloudApiUnauthorizedException(),
      );
      expect(spy).toHaveBeenCalledTimes(2);
    });
    it('should throw an error from 1st attempt when no Anauthorized Error', async () => {
      spy.mockRejectedValueOnce(new CloudApiInternalServerErrorException());

      await expect(service.me(mockSessionMetadata)).rejects.toEqual(
        new CloudApiInternalServerErrorException(),
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserSession', () => {
    let spy;

    beforeEach(async () => {
      spy = jest.spyOn(service as any, 'ensureCloudUser');
      spy.mockResolvedValue(undefined);
    });

    it('should get user session', async () => {
      expect(await service.getUserSession(mockSessionMetadata)).toEqual(
        mockCloudSession,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
    });
    it('should get user session from 2nd attempt', async () => {
      spy.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      spy.mockResolvedValueOnce(undefined);

      expect(await service.getUserSession(mockSessionMetadata)).toEqual(
        mockCloudSession,
      );
      expect(spy).toHaveBeenCalledTimes(2);
    });
    it('should throw an error if retries attempts exceeded', async () => {
      spy.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      spy.mockRejectedValueOnce(new CloudApiUnauthorizedException());

      await expect(service.getUserSession(mockSessionMetadata)).rejects.toEqual(
        new CloudApiUnauthorizedException(),
      );
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('setCurrentAccount', () => {
    let spy;
    let response;

    beforeEach(async () => {
      jest
        .spyOn(service as any, 'ensureCloudUser')
        .mockResolvedValue(undefined);
      spy = jest.spyOn(service, 'getCloudUser');
      spy.mockResolvedValue(mockCloudUser);
    });

    it('should set user account', async () => {
      response = {
        status: 200,
        data: {},
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(
        await service.setCurrentAccount(
          mockSessionMetadata,
          mockCloudUser.currentAccountId,
        ),
      ).toEqual(mockCloudUser);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it('should set user account from 2nd attempt', async () => {
      response = {
        status: 200,
        data: {},
      };
      mockedAxios.post.mockRejectedValueOnce(mockCapiUnauthorizedError);
      mockedAxios.post.mockResolvedValueOnce(mockCapiUnauthorizedError);

      expect(
        await service.setCurrentAccount(
          mockSessionMetadata,
          mockCloudUser.currentAccountId,
        ),
      ).toEqual(mockCloudUser);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
    it('should throw an error if retries attempts exceeded', async () => {
      response = {
        status: 200,
        data: {},
      };
      mockedAxios.post.mockRejectedValueOnce(mockCapiUnauthorizedError);
      mockedAxios.post.mockRejectedValueOnce(mockCapiUnauthorizedError);

      await expect(
        service.setCurrentAccount(
          mockSessionMetadata,
          mockCloudUser.currentAccountId,
        ),
      ).rejects.toEqual(
        new CloudApiUnauthorizedException(mockCapiUnauthorizedError.message),
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateUser', () => {
    it('should update cloud user', async () => {
      expect(
        await service.updateUser(mockSessionMetadata, { currentAccountId: 1 }),
      ).toEqual(mockCloudUser);
      expect(repository.update).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
        { currentAccountId: 1 },
      );
    });
  });
});
