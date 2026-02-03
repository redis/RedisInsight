import axios from 'axios';
import {
  mockRdiUnauthorizedError,
  RdiFactory,
  RdiClientMetadataFactory,
  V2RdiInfoApiResponseFactory,
  V2PipelineInfoFactory,
  V2PipelineStatusApiResponseFactory,
  RdiInfoFactory,
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
  const mockRdiClientMetadata = RdiClientMetadataFactory.build();
  const mockRdi = RdiFactory.build();

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiV2RdiClient(mockRdiClientMetadata, mockRdi);
  });

  describe('getInfo', () => {
    it('should return RDI info when API call is successful', async () => {
      const mockInfoResponse = V2RdiInfoApiResponseFactory.build({
        version: '2.0.1',
      });
      const expectedRdiInfo = RdiInfoFactory.build({ version: '2.0.1' });
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
      const mockInfoResponse = V2RdiInfoApiResponseFactory.build({
        version: '2.1.0',
      });
      mockedAxios.get.mockResolvedValueOnce({ data: mockInfoResponse });

      const result = await client.getInfo();

      expect(result).toBeInstanceOf(RdiInfo);
      expect(result.version).toBe('2.1.0');
    });
  });

  describe('selectPipeline', () => {
    it('should select first pipeline when pipelines are available', async () => {
      const mockPipelinesResponse = [
        V2PipelineInfoFactory.build({ name: 'pipeline-1' }),
        V2PipelineInfoFactory.build({ name: 'pipeline-2' }),
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
        V2PipelineInfoFactory.build({ name: 'first' }),
        V2PipelineInfoFactory.build({ name: 'second' }),
        V2PipelineInfoFactory.build({ name: 'third' }),
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPipelinesResponse });

      await client.selectPipeline();

      expect(client['selectedPipeline']).toBe('first');
    });
  });

  describe('getPipelineStatus', () => {
    it('should return RdiPipelineStatus when API call is successful', async () => {
      const mockV2Response = V2PipelineStatusApiResponseFactory.build({
        status: 'started',
      });

      mockedAxios.get.mockResolvedValueOnce({ data: mockV2Response });

      const result = await client.getPipelineStatus();

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBe('started');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        RdiUrlV2.GetPipelineStatus('default'),
      );
    });

    it('should throw wrapped error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getPipelineStatus()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });

    it('should use selectedPipeline in the URL', async () => {
      client['selectedPipeline'] = 'my-pipeline';
      const mockV2Response = V2PipelineStatusApiResponseFactory.build();

      mockedAxios.get.mockResolvedValueOnce({ data: mockV2Response });

      await client.getPipelineStatus();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        RdiUrlV2.GetPipelineStatus('my-pipeline'),
      );
    });
  });

  describe('getVersion', () => {
    it('should return version from info endpoint', async () => {
      const mockInfoResponse = V2RdiInfoApiResponseFactory.build({
        version: '2.1.0',
      });
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
