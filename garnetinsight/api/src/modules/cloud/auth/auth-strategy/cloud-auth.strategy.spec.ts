import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GithubIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/github-idp.cloud.auth-strategy';
import { mockCloudApiAuthDto, mockSessionMetadata } from 'src/__mocks__';
import {
  mockCloudAuthCode,
  mockCloudAuthGithubRequest,
  mockCloudAuthGithubTokenParams,
  mockCloudAuthGoogleAuthUrl,
  mockCloudAuthGoogleRenewTokenUrl,
  mockCloudAuthGoogleRequest,
  mockCloudAuthGoogleRevokeTokenUrl,
  mockCloudAuthGoogleTokenUrl,
  mockCloudRefreshToken,
  mockCloudRevokeRefreshTokenHint,
  mockOktaAuthClient,
} from 'src/__mocks__/cloud-auth';
import { OktaAuth } from '@okta/okta-auth-js';
import { GoogleIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/google-idp.cloud.auth-strategy';
import { CloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/cloud-auth.strategy';

jest.mock('@okta/okta-auth-js');

describe('CloudAuthStrategy', () => {
  let googleStrategy: GoogleIdpCloudAuthStrategy;
  let githubStrategy: GithubIdpCloudAuthStrategy;

  beforeEach(async () => {
    (OktaAuth as any).mockReturnValueOnce(mockOktaAuthClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        GithubIdpCloudAuthStrategy,
        GoogleIdpCloudAuthStrategy,
      ],
    }).compile();

    googleStrategy = await module.get(GoogleIdpCloudAuthStrategy);
    githubStrategy = await module.get(GithubIdpCloudAuthStrategy);
  });

  describe('generateAuthRequest', () => {
    it('Check that Google auth request is generated', async () => {
      expect(
        await googleStrategy.generateAuthRequest(mockSessionMetadata),
      ).toEqual({
        ...mockCloudAuthGoogleRequest,
        createdAt: expect.anything(),
      });
    });

    it('Check that Github auth request is generated', async () => {
      mockOktaAuthClient.token.prepareTokenParams.mockResolvedValueOnce(
        mockCloudAuthGithubTokenParams,
      );
      expect(
        await githubStrategy.generateAuthRequest(mockSessionMetadata),
      ).toEqual({
        ...mockCloudAuthGithubRequest,
        createdAt: expect.anything(),
      });
    });
  });

  describe('generateAuthUrl', () => {
    it('Should generate proper auth url', () => {
      expect(
        CloudAuthStrategy.generateAuthUrl(mockCloudAuthGoogleRequest),
      ).toEqual(new URL(mockCloudAuthGoogleAuthUrl));
    });
  });

  describe('generateRenewTokensUrl', () => {
    it('Should generate proper renew url', () => {
      expect(
        googleStrategy.generateRenewTokensUrl(mockCloudApiAuthDto.refreshToken),
      ).toEqual(new URL(mockCloudAuthGoogleRenewTokenUrl));
    });
  });

  describe('generateRevokeTokensUrl', () => {
    it('Should generate proper revoke url', () => {
      expect(
        googleStrategy.generateRevokeTokensUrl(
          mockCloudRefreshToken,
          mockCloudRevokeRefreshTokenHint,
        ),
      ).toEqual(new URL(mockCloudAuthGoogleRevokeTokenUrl));
    });
  });

  describe('generateExchangeCodeUrl', () => {
    it('Should generate exchange code url', () => {
      expect(
        CloudAuthStrategy.generateExchangeCodeUrl(
          mockCloudAuthGoogleRequest,
          mockCloudAuthCode,
        ),
      ).toEqual(new URL(mockCloudAuthGoogleTokenUrl));
    });
  });
});
