import axios from 'axios';
import {
  mockRdi,
  mockRdiClientMetadata,
  mockRdiUnauthorizedError,
} from 'src/__mocks__';
import { ApiV2RdiClient } from 'src/modules/rdi/client/api/v2/api.v2.rdi.client';
import { RdiUrlV2 } from 'src/modules/rdi/constants';
import { RdiInfo, RdiPipelineStatus } from 'src/modules/rdi/models';
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

  describe('getPipelineStatus', () => {
    it('should return RdiPipelineStatus when API call is successful', async () => {
      const mockV1Response = {
        pipelines: { default: { status: 'ready', state: 'cdc' } },
        components: {},
      };
      const mockV2Response = {
        status: 'started',
        errors: [],
        components: [
          {
            name: 'processor',
            type: 'stream-processor',
            version: '0.0.202512301417',
            status: 'started',
            errors: [],
          },
        ],
        current: true,
      };

      // First call is to super.getPipelineStatus() (V1)
      mockedAxios.get.mockResolvedValueOnce({ data: mockV1Response });
      // Second call is to V2 endpoint
      mockedAxios.get.mockResolvedValueOnce({ data: mockV2Response });

      const result = await client.getPipelineStatus();

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBe('started');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        RdiUrlV2.GetPipelineStatus('default'),
      );
    });

    it('should throw wrapped error when API call fails', async () => {
      // First call to super succeeds
      mockedAxios.get.mockResolvedValueOnce({
        data: { pipelines: { default: {} }, components: {} },
      });
      // Second call fails
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getPipelineStatus()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });

    it('should use selectedPipeline in the URL', async () => {
      client['selectedPipeline'] = 'my-pipeline';

      const mockV1Response = {
        pipelines: { default: { status: 'ready', state: 'cdc' } },
        components: {},
      };
      const mockV2Response = {
        status: 'started',
        errors: [],
        components: [],
        current: true,
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockV1Response });
      mockedAxios.get.mockResolvedValueOnce({ data: mockV2Response });

      await client.getPipelineStatus();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        RdiUrlV2.GetPipelineStatus('my-pipeline'),
      );
    });
  });

  describe('getVersion', () => {
    it('should return version from info endpoint', async () => {
      const mockInfoResponse = { version: '2.1.0' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockInfoResponse });

      const result = await client.getVersion();

      expect(result).toBe('2.1.0');
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrlV2.GetInfo);
    });

    it('should return default version when version is missing', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      const result = await client.getVersion();

      expect(result).toBe('-');
    });

    it('should return default version when data is undefined', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: undefined });

      const result = await client.getVersion();

      expect(result).toBe('-');
    });

    it('should throw wrapped error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getVersion()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });
});
