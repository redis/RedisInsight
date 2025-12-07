import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { sign } from 'jsonwebtoken';
import {
  mockRdi,
  mockRdiClientMetadata,
  mockRdiUnauthorizedError,
} from 'src/__mocks__';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { RdiUrl } from 'src/modules/rdi/constants';
import { RdiPipelineUnauthorizedException } from 'src/modules/rdi/exceptions';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('RdiClientFactory', () => {
  let module: TestingModule;
  let service: RdiClientFactory;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [RdiClientFactory],
    }).compile();

    service = await module.get(RdiClientFactory);
  });

  describe('createClient', () => {
    it('should create client', async () => {
      const mockedAccessToken = sign(
        { exp: Math.trunc(Date.now() / 1000) + 3600 },
        'test',
      );

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {
          access_token: mockedAccessToken,
        },
      });
      await service.createClient(mockRdiClientMetadata, mockRdi);

      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.Login, {
        password: mockRdi.password,
        username: mockRdi.username,
      });
    });
    it('should not create client if auth request will failed', async () => {
      mockedAxios.post.mockRejectedValue(mockRdiUnauthorizedError);

      await expect(
        service.createClient(mockRdiClientMetadata, mockRdi),
      ).rejects.toThrow(RdiPipelineUnauthorizedException);
    });
  });
});
