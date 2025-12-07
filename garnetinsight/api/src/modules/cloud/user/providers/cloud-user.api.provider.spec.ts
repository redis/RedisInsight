import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockCapiUnauthorizedError,
  mockCloudApiAuthDto,
  mockCloudApiCsrfToken,
  mockCloudApiHeaders,
  mockCloudApiUser,
  mockCloudCapiAccount,
  mockCloudSession,
  mockCloudSessionService,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudUserApiProvider } from 'src/modules/cloud/user/providers/cloud-user.api.provider';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudUserApiProvider', () => {
  let service: CloudUserApiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudUserApiProvider,
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
      ],
    }).compile();

    service = module.get(CloudUserApiProvider);
  });

  describe('getCsrfToken', () => {
    it('successfully get capi access key', async () => {
      const response = {
        status: 200,
        data: { csrfToken: mockCloudApiCsrfToken },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getCsrfToken(mockCloudSession)).toEqual(
        mockCloudApiCsrfToken.csrf_token,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith('csrf', mockCloudApiHeaders);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getCsrfToken(mockCloudSession)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('getApiSessionId', () => {
    it('successfully get api session id (login to api)', async () => {
      const response = {
        status: 200,
        headers: {
          'set-cookie': [
            `anything;JSESSIONID=${mockCloudApiAuthDto.apiSessionId};anything;`,
          ],
        },
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(await service.getApiSessionId(mockCloudSession)).toEqual(
        mockCloudApiAuthDto.apiSessionId,
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'login',
        {
          auth_mode: mockCloudSession.idpType,
        },
        {
          ...mockCloudApiHeaders,
        },
      );
    });
    it('successfully get api session id (login to api) with utm parameters', async () => {
      const response = {
        status: 200,
        headers: {
          'set-cookie': [
            `anything;JSESSIONID=${mockCloudApiAuthDto.apiSessionId};anything;`,
          ],
        },
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(
        await service.getApiSessionId(mockCloudSession, {
          source: 's',
          medium: 'm',
          campaign: 'c',
        }),
      ).toEqual(mockCloudApiAuthDto.apiSessionId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'login',
        {
          auth_mode: mockCloudSession.idpType,
          utm_source: 's',
          utm_medium: 'm',
          utm_campaign: 'c',
        },
        {
          ...mockCloudApiHeaders,
        },
      );
    });
    it('successfully get api session id (login to api) with defined only utm parameters', async () => {
      const response = {
        status: 200,
        headers: {
          'set-cookie': [
            `anything;JSESSIONID=${mockCloudApiAuthDto.apiSessionId};anything;`,
          ],
        },
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(
        await service.getApiSessionId(mockCloudSession, { medium: 'm' }),
      ).toEqual(mockCloudApiAuthDto.apiSessionId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'login',
        {
          auth_mode: mockCloudSession.idpType,
          utm_medium: 'm',
        },
        {
          ...mockCloudApiHeaders,
        },
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.post.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getApiSessionId(mockCloudSession)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('successfully get current user', async () => {
      const response = {
        status: 200,
        data: mockCloudApiUser,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getCurrentUser(mockCloudSession)).toEqual(
        mockCloudApiUser,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/users/me',
        mockCloudApiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getCurrentUser(mockCloudSession)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('getAccounts', () => {
    it('successfully get user accounts', async () => {
      const response = {
        status: 200,
        data: { accounts: [mockCloudCapiAccount] },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getAccounts(mockCloudSession)).toEqual([
        mockCloudCapiAccount,
      ]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/accounts',
        mockCloudApiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getAccounts(mockCloudSession)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('setCurrentAccount', () => {
    it('successfully set current accounts', async () => {
      const response = {
        status: 200,
        data: {},
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(
        await service.setCurrentAccount(
          mockCloudSession,
          mockCloudCapiAccount.id,
        ),
      ).toEqual(undefined);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `/accounts/setcurrent/${mockCloudCapiAccount.id}`,
        {},
        mockCloudApiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.post.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(
        service.setCurrentAccount(mockCloudSession, mockCloudCapiAccount.id),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
});
