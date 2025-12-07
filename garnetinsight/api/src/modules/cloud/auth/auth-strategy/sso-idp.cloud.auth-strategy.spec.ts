import axios from 'axios';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockSessionMetadata } from 'src/__mocks__';
import {
  mockCloudAuthSsoRequest,
  mockCloudAuthSsoTokenParams,
  mockOktaAuthClient,
} from 'src/__mocks__/cloud-auth';
import { OktaAuth } from '@okta/okta-auth-js';
import { SsoIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/sso-idp.cloud.auth-strategy';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';
import { CloudOauthSsoUnsupportedEmailException } from 'src/modules/cloud/auth/exceptions/cloud-oauth.sso-unsupported-email.exception';

jest.mock('@okta/okta-auth-js');
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');

describe('CloudAuthStrategy', () => {
  let ssoStrategy: SsoIdpCloudAuthStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('axios', () => mockedAxios);
    (OktaAuth as any).mockReturnValueOnce(mockOktaAuthClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, SsoIdpCloudAuthStrategy],
    }).compile();

    ssoStrategy = await module.get(SsoIdpCloudAuthStrategy);
  });

  describe('generateAuthRequest', () => {
    it('Check that Sso auth request is generated', async () => {
      mockOktaAuthClient.token.prepareTokenParams.mockResolvedValueOnce(
        mockCloudAuthSsoTokenParams,
      );
      mockedAxios.get.mockResolvedValue({ data: mockCloudAuthSsoRequest.idp });

      expect(
        await ssoStrategy.generateAuthRequest(mockSessionMetadata, {
          strategy: CloudAuthIdpType.Sso,
          data: {
            email: '1@mail.com',
          },
        }),
      ).toEqual({
        ...mockCloudAuthSsoRequest,
        createdAt: expect.anything(),
      });
    });
    it('should throw CloudOauthSsoUnsupportedEmailException in case of idp check error ', async () => {
      mockOktaAuthClient.token.prepareTokenParams.mockResolvedValueOnce(
        mockCloudAuthSsoTokenParams,
      );
      mockedAxios.get.mockRejectedValueOnce(new Error());

      await expect(
        ssoStrategy.generateAuthRequest(mockSessionMetadata, {
          strategy: CloudAuthIdpType.Sso,
        }),
      ).rejects.toThrow(CloudOauthSsoUnsupportedEmailException);
    });
    it('should throw CloudOauthSsoUnsupportedEmailException in case of idp check error ', async () => {
      mockOktaAuthClient.token.prepareTokenParams.mockResolvedValueOnce(
        mockCloudAuthSsoTokenParams,
      );
      mockedAxios.get.mockRejectedValueOnce(new Error());

      await expect(
        ssoStrategy.generateAuthRequest(mockSessionMetadata),
      ).rejects.toThrow(CloudOauthSsoUnsupportedEmailException);
    });
  });
});
