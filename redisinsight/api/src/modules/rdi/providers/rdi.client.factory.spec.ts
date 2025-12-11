import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { sign } from 'jsonwebtoken';
import {
  mockRdi,
  mockRdiClientMetadata,
  mockRdiUnauthorizedError,
} from 'src/__mocks__';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { RdiUrl, RdiUrlV2 } from 'src/modules/rdi/constants';
import { RdiPipelineUnauthorizedException } from 'src/modules/rdi/exceptions';
import { ApiV2RdiClient } from 'src/modules/rdi/client/api/v2/api.v2.rdi.client';
import { ApiRdiClient } from 'src/modules/rdi/client/api/v1/api.rdi.client';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('RdiClientFactory', () => {
  let module: TestingModule;
  let service: RdiClientFactory;

  beforeEach(async () => {
    jest.clearAllMocks();
    module = await Test.createTestingModule({
      providers: [RdiClientFactory],
    }).compile();

    service = await module.get(RdiClientFactory);
  });

  describe('createClient', () => {
    describe('v2 client creation', () => {
      it('should create v2 client when getInfo succeeds', async () => {
        const mockedAccessToken = sign(
          { exp: Math.trunc(Date.now() / 1000) + 3600 },
          'test',
        );
        const mockInfoResponse = { version: '2.0.1' };
        const mockPipelinesResponse = [
          {
            name: 'pipeline-1',
            active: true,
            config: {},
            status: 'running',
            errors: [],
            components: [],
            current: true,
          },
        ];

        // Mock getInfo call
        mockedAxios.get.mockResolvedValueOnce({ data: mockInfoResponse });
        // Mock connect call
        mockedAxios.post.mockResolvedValueOnce({
          status: 200,
          data: {
            access_token: mockedAccessToken,
          },
        });
        // Mock selectPipeline call
        mockedAxios.get.mockResolvedValueOnce({ data: mockPipelinesResponse });

        const client = await service.createClient(
          mockRdiClientMetadata,
          mockRdi,
        );

        expect(client).toBeInstanceOf(ApiV2RdiClient);
        expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrlV2.GetInfo);
        expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.Login, {
          password: mockRdi.password,
          username: mockRdi.username,
        });
        expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrlV2.GetPipelines);
      });

      it('should call connect and selectPipeline for v2 client', async () => {
        const mockedAccessToken = sign(
          { exp: Math.trunc(Date.now() / 1000) + 3600 },
          'test',
        );
        const mockInfoResponse = { version: '2.1.0' };
        const mockPipelinesResponse = [
          {
            name: 'default',
            active: true,
            config: {},
            status: 'running',
            errors: [],
            components: [],
            current: true,
          },
        ];

        mockedAxios.get.mockResolvedValueOnce({ data: mockInfoResponse });
        mockedAxios.post.mockResolvedValueOnce({
          status: 200,
          data: { access_token: mockedAccessToken },
        });
        mockedAxios.get.mockResolvedValueOnce({ data: mockPipelinesResponse });

        const client = await service.createClient(
          mockRdiClientMetadata,
          mockRdi,
        );

        expect(client).toBeInstanceOf(ApiV2RdiClient);
        expect(client['selectedPipeline']).toBe('default');
      });
    });

    describe('v1 client fallback', () => {
      it('should fallback to v1 client when getInfo fails', async () => {
        const mockedAccessToken = sign(
          { exp: Math.trunc(Date.now() / 1000) + 3600 },
          'test',
        );

        // Mock getInfo failure (v2 not available)
        mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));
        // Mock v1 connect call
        mockedAxios.post.mockResolvedValueOnce({
          status: 200,
          data: {
            access_token: mockedAccessToken,
          },
        });

        const client = await service.createClient(
          mockRdiClientMetadata,
          mockRdi,
        );

        expect(client).toBeInstanceOf(ApiRdiClient);
        expect(client).not.toBeInstanceOf(ApiV2RdiClient);
        expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.Login, {
          password: mockRdi.password,
          username: mockRdi.username,
        });
      });

      it('should fallback to v1 client when getInfo returns null', async () => {
        const mockedAccessToken = sign(
          { exp: Math.trunc(Date.now() / 1000) + 3600 },
          'test',
        );

        // Mock getInfo returning null (endpoint exists but returns null)
        mockedAxios.get.mockResolvedValueOnce({ data: null });
        // Mock v1 connect call
        mockedAxios.post.mockResolvedValueOnce({
          status: 200,
          data: {
            access_token: mockedAccessToken,
          },
        });

        const client = await service.createClient(
          mockRdiClientMetadata,
          mockRdi,
        );

        expect(client).toBeInstanceOf(ApiRdiClient);
        expect(client).not.toBeInstanceOf(ApiV2RdiClient);
      });

      it('should not create client if v1 auth request fails', async () => {
        // Mock getInfo failure (v2 not available)
        mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));
        // Mock v1 auth failure
        mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

        await expect(
          service.createClient(mockRdiClientMetadata, mockRdi),
        ).rejects.toThrow(RdiPipelineUnauthorizedException);
      });
    });
  });
});
