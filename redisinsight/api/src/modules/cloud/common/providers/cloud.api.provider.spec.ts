import {
  CloudRequestUtm,
  ICloudApiCredentials,
} from 'src/modules/cloud/common/models';
import {
  mockCloudSessionService,
  mockDefaultCloudApiHeaders,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { Test, TestingModule } from '@nestjs/testing';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { CloudUserApiProvider } from 'src/modules/cloud/user/providers/cloud-user.api.provider';
import {
  CloudApiForbiddenException,
  CloudApiUnauthorizedException,
} from 'src/modules/cloud/common/exceptions';
import { CloudApiProvider } from './cloud.api.provider';

const generateUtmBodyTests = [
  {
    input: null,
    expected: {},
  },
  {
    input: { source: 'source' },
    expected: {
      utm_source: 'source',
    },
  },
  {
    input: { medium: 'medium' },
    expected: {
      utm_medium: 'medium',
    },
  },
  {
    input: { source: 'source', medium: 'medium', campaign: 'campaign' },
    expected: {
      utm_source: 'source',
      utm_medium: 'medium',
      utm_campaign: 'campaign',
    },
  },
  {
    input: { campaign: 'campaign' },
    expected: {
      utm_campaign: 'campaign',
    },
  },
];

const getHeadersTests = [
  {
    expected: { ...mockDefaultCloudApiHeaders },
  },
  {
    input: {},
    expected: { ...mockDefaultCloudApiHeaders },
  },
  {
    input: { accessToken: 'jwt-token' },
    expected: {
      ...mockDefaultCloudApiHeaders,
      authorization: 'Bearer jwt-token',
    },
  },
  {
    input: { apiSessionId: 'id' },
    expected: { ...mockDefaultCloudApiHeaders, cookie: 'JSESSIONID=id' },
  },
  {
    input: { csrf: 'csrf-token' },
    expected: { ...mockDefaultCloudApiHeaders, 'x-csrf-token': 'csrf-token' },
  },
  {
    input: { idToken: 'id-token-value' },
    expected: {
      ...mockDefaultCloudApiHeaders,
      'Sm-Id-Token': 'id-token-value',
    },
  },
  {
    input: {
      accessToken: 'jwt-token',
      idToken: 'id-token-value',
      csrf: 'csrf-token',
    },
    expected: {
      ...mockDefaultCloudApiHeaders,
      authorization: 'Bearer jwt-token',
      'x-csrf-token': 'csrf-token',
      'Sm-Id-Token': 'id-token-value',
    },
  },
];

const mockedResult = 'mockedResult';
const mockedFn = jest.fn().mockResolvedValue(mockedResult);

describe('CloudApiProvider', () => {
  let service: CloudUserApiProvider;
  let sessionService: MockType<CloudSessionService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudUserApiProvider,
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
      ],
    }).compile();

    service = await module.get(CloudUserApiProvider);
    sessionService = await module.get(CloudSessionService);
  });

  describe('callWithAuthRetry', () => {
    it('should return result from 1st attempt', async () => {
      expect(
        await service.callWithAuthRetry(
          mockSessionMetadata.sessionId,
          mockedFn,
        ),
      ).toEqual(mockedResult);
      expect(sessionService.invalidateApiSession).toHaveBeenCalledTimes(0);
    });
    it('should not fail when session invalidation throw an error', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      sessionService.invalidateApiSession.mockRejectedValueOnce(
        new Error('Unable to invalidate'),
      );
      expect(
        await service.callWithAuthRetry(
          mockSessionMetadata.sessionId,
          mockedFn,
        ),
      ).toEqual(mockedResult);
      expect(sessionService.invalidateApiSession).toHaveBeenCalledWith(
        mockSessionMetadata.sessionId,
      );
      expect(sessionService.invalidateApiSession).toHaveBeenCalledTimes(1);
    });
    it('should throw an error from 1st attempt if not CloudApiUnauthorizedException (and keep session)', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiForbiddenException());
      await expect(
        service.callWithAuthRetry(mockSessionMetadata.sessionId, mockedFn),
      ).rejects.toBeInstanceOf(CloudApiForbiddenException);
      expect(sessionService.invalidateApiSession).toHaveBeenCalledTimes(0);
    });
    it('should throw CloudApiForbiddenException error from 2nd attempt (by default)', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(
        service.callWithAuthRetry(mockSessionMetadata.sessionId, mockedFn),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(mockedFn).toHaveBeenCalledTimes(2);
      expect(sessionService.invalidateApiSession).toHaveBeenCalledTimes(1);
    });
    it('should throw CloudApiForbiddenException error from 3rd attempt (custom attempts)', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(
        service.callWithAuthRetry(mockSessionMetadata.sessionId, mockedFn, 2),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(mockedFn).toHaveBeenCalledTimes(3);
      expect(sessionService.invalidateApiSession).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateUtmQuery', () => {
    test.each(generateUtmBodyTests)('%j', ({ input, expected }) => {
      expect(
        CloudApiProvider.generateUtmBody(input as CloudRequestUtm),
      ).toEqual(expected);
    });
  });

  describe('getHeaders', () => {
    test.each(getHeadersTests)('%j', ({ input, expected }) => {
      expect(
        CloudApiProvider.getHeaders(input as ICloudApiCredentials),
      ).toEqual({ headers: expected });
    });
  });
});
