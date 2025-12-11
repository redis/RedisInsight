import axios from 'axios';
import {
  mockRdi,
  mockRdiClientMetadata,
  mockRdiUnauthorizedError,
} from 'src/__mocks__';
import { ApiV2RdiClient } from 'src/modules/rdi/client/api/v2/api.v2.rdi.client';
import { RdiUrlV2 } from 'src/modules/rdi/constants';
import { RdiInfo } from 'src/modules/rdi/models';
import { RdiPipelineInternalServerErrorException } from 'src/modules/rdi/exceptions';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('ApiV2RdiClient', () => {
  let client: ApiV2RdiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiV2RdiClient(mockRdiClientMetadata, mockRdi);
  });

  describe('getInfo', () => {
    it('should return RDI info when API call is successful', async () => {
      const mockInfoResponse = { version: '2.0.1' };
      const expectedRdiInfo = Object.assign(new RdiInfo(), {
        version: '2.0.1',
      });
      mockedAxios.get.mockResolvedValueOnce({ data: mockInfoResponse });

      const result = await client.getInfo();

      expect(result).toEqual(expectedRdiInfo);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrlV2.GetInfo);
    });

    it('should throw wrapped error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getInfo()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrlV2.GetInfo);
    });

    it('should transform response data to RdiInfo instance', async () => {
      const mockInfoResponse = { version: '2.1.0' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockInfoResponse });

      const result = await client.getInfo();

      expect(result).toBeInstanceOf(RdiInfo);
      expect(result.version).toBe('2.1.0');
    });
  });

  describe('selectPipeline', () => {
    it('should select first pipeline when pipelines are available', async () => {
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
        {
          name: 'pipeline-2',
          active: false,
          config: {},
          status: 'stopped',
          errors: [],
          components: [],
          current: false,
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPipelinesResponse });

      await client.selectPipeline();

      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrlV2.GetPipelines);
      expect(client['selectedPipeline']).toBe('pipeline-1');
    });

    it('should throw RdiPipelineInternalServerErrorException when no pipelines available', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await expect(client.selectPipeline()).rejects.toThrow(
        RdiPipelineInternalServerErrorException,
      );
    });

    it('should throw error with message "Unable to select pipeline" when no pipelines available', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await expect(client.selectPipeline()).rejects.toThrow(
        'Unable to select pipeline',
      );
    });

    it('should throw RdiPipelineInternalServerErrorException when data is null', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });

      await expect(client.selectPipeline()).rejects.toThrow(
        RdiPipelineInternalServerErrorException,
      );
    });

    it('should throw RdiPipelineInternalServerErrorException when data is undefined', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: undefined });

      await expect(client.selectPipeline()).rejects.toThrow(
        RdiPipelineInternalServerErrorException,
      );
    });

    it('should throw wrapped error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.selectPipeline()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrlV2.GetPipelines);
    });

    it('should select first pipeline even when multiple pipelines exist', async () => {
      const mockPipelinesResponse = [
        {
          name: 'first',
          active: false,
          config: {},
          status: 'stopped',
          errors: [],
          components: [],
          current: false,
        },
        {
          name: 'second',
          active: true,
          config: {},
          status: 'running',
          errors: [],
          components: [],
          current: true,
        },
        {
          name: 'third',
          active: false,
          config: {},
          status: 'stopped',
          errors: [],
          components: [],
          current: false,
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPipelinesResponse });

      await client.selectPipeline();

      expect(client['selectedPipeline']).toBe('first');
    });
  });
});
