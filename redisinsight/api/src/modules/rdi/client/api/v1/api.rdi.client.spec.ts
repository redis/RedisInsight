import axios from 'axios';
import {
  mockRdi,
  mockRdiClientMetadata,
  mockRdiConfigSchema,
  mockRdiDryRunJob,
  mockRdiJobsSchema,
  mockRdiPipeline,
  mockRdiSchema,
  mockRdiUnauthorizedError,
} from 'src/__mocks__';
import { sign } from 'jsonwebtoken';
import { ApiRdiClient } from 'src/modules/rdi/client/api/v1/api.rdi.client';
import {
  RdiDyRunJobStatus,
  RdiPipeline,
  RdiStatisticsStatus,
} from 'src/modules/rdi/models';
import {
  PipelineActions,
  RdiUrl,
  TOKEN_THRESHOLD,
} from 'src/modules/rdi/constants';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

const createMockPostImplementation = (
  targetsResponses: (any | Error)[],
  sourcesResponses: (any | Error)[],
) => {
  let targetsCallCount = 0;
  let sourcesCallCount = 0;

  return (url: string) => {
    if (url === RdiUrl.TestTargetsConnections) {
      // eslint-disable-next-line no-plusplus
      const response = targetsResponses[targetsCallCount++];
      return response instanceof Error
        ? Promise.reject(response)
        : Promise.resolve(response);
    }
    if (url === RdiUrl.TestSourcesConnections) {
      // eslint-disable-next-line no-plusplus
      const response = sourcesResponses[sourcesCallCount++];
      return response instanceof Error
        ? Promise.reject(response)
        : Promise.resolve(response);
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  };
};

const axiosError = (status: number, message = 'Request failed') => ({
  isAxiosError: true,
  message,
  status,
});

describe('ApiRdiClient', () => {
  let client: ApiRdiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiRdiClient(mockRdiClientMetadata, mockRdi);
  });

  describe('getSchema', () => {
    it('should return schema', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRdiConfigSchema });
      mockedAxios.get.mockResolvedValueOnce({ data: mockRdiJobsSchema });

      const result = await client.getSchema();

      expect(result).toEqual(mockRdiSchema);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetConfigSchema);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetJobsSchema);
    });

    it('should throw error if request fails', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRdiConfigSchema });
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getSchema()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('getPipeline', () => {
    it('should return pipeline', async () => {
      const data = { config: {} };
      const mockedPipeline = Object.assign(new RdiPipeline(), {
        jobs: {},
        config: {},
      });
      mockedAxios.get.mockResolvedValueOnce({ data });

      const result = await client.getPipeline();

      expect(result).toEqual(mockedPipeline);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetPipeline);
    });

    it('should throw error if request fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getPipeline()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('getStrategies', () => {
    it('should return strategies data when API call is successful', async () => {
      const mockData = { strategies: [{ id: 1, name: 'Strategy 1' }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getStrategies();

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetStrategies);
    });

    it('should throw an error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getStrategies()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
      expect(axios.get).toHaveBeenCalledWith(RdiUrl.GetStrategies);
    });
  });

  describe('getConfigTemplate', () => {
    const pipelineType = 'test-pipeline';
    const dbType = 'test-db';

    it('should return the config template when the API call is successful', async () => {
      const expectedResponse = { template: 'some template' };
      mockedAxios.get.mockResolvedValueOnce({ data: expectedResponse });

      const result = await client.getConfigTemplate(pipelineType, dbType);

      expect(result).toEqual(expectedResponse);
      expect(axios.get).toHaveBeenCalledWith(
        `${RdiUrl.GetConfigTemplate}/${pipelineType}/${dbType}`,
      );
    });

    it('should throw an error when the API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(
        client.getConfigTemplate(pipelineType, dbType),
      ).rejects.toThrowError(mockRdiUnauthorizedError.message);
    });
  });

  describe('getJobTemplate', () => {
    const pipelineType = 'test-pipeline';

    it('should return the job template when the API call is successful', async () => {
      const expectedResponse = {
        transformations: {
          status: RdiDyRunJobStatus.Success,
        },
        commands: {
          status: RdiDyRunJobStatus.Success,
        },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: expectedResponse });

      const result = await client.getJobTemplate(pipelineType);

      expect(result).toEqual(expectedResponse);
      expect(axios.get).toHaveBeenCalledWith(
        `${RdiUrl.GetJobTemplate}/${pipelineType}`,
      );
    });

    it('should throw an error when the API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getJobTemplate(pipelineType)).rejects.toThrowError(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('deploy', () => {
    it('should deploy the pipeline and poll for status', async () => {
      const actionId = '123';
      const postResponse = { data: { action_id: actionId } };
      const getResponse = {
        data: {
          status: 'completed',
          data: 'some data',
          error: '',
        },
      };
      // const postMock = jest.spyOn(client, 'post').mockResolvedValue(response);
      mockedAxios.post.mockResolvedValueOnce(postResponse);
      mockedAxios.get.mockResolvedValueOnce(getResponse);

      const result = await client.deploy(mockRdiPipeline);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        RdiUrl.Deploy,
        expect.any(Object),
      );
      expect(result).toEqual(getResponse.data.data);
    });

    it('should throw an error if the deployment fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.deploy(mockRdiPipeline)).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('startPipeline', () => {
    it('should start the pipeline and poll for status', async () => {
      const actionId = '123';
      const postResponse = { data: { action_id: actionId } };
      const getResponse = {
        data: {
          status: 'completed',
          data: 'some data',
          error: '',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(postResponse);
      mockedAxios.get.mockResolvedValueOnce(getResponse);

      const result = await client.startPipeline();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        RdiUrl.StartPipeline,
        expect.any(Object),
      );
      expect(result).toEqual(getResponse.data.data);
    });

    it('should throw an error if start pipeline fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.startPipeline()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('stopPipeline', () => {
    it('should stop the pipeline and poll for status', async () => {
      const actionId = '123';
      const postResponse = { data: { action_id: actionId } };
      const getResponse = {
        data: {
          status: 'completed',
          data: 'some data',
          error: '',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(postResponse);
      mockedAxios.get.mockResolvedValueOnce(getResponse);

      const result = await client.stopPipeline();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        RdiUrl.StopPipeline,
        expect.any(Object),
      );
      expect(result).toEqual(getResponse.data.data);
    });

    it('should throw an error if stop pipeline fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.stopPipeline()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('resetPipeline', () => {
    it('should reset the pipeline and poll for status', async () => {
      const actionId = '123';
      const postResponse = { data: { action_id: actionId } };
      const getResponse = {
        data: {
          status: 'completed',
          data: 'some data',
          error: '',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(postResponse);
      mockedAxios.get.mockResolvedValueOnce(getResponse);

      const result = await client.resetPipeline();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        RdiUrl.ResetPipeline,
        expect.any(Object),
      );
      expect(result).toEqual(getResponse.data.data);
    });

    it('should throw an error if reset pipeline fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.resetPipeline()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('dryRunJob', () => {
    it('should call the RDI client with the correct URL and data', async () => {
      const mockResponse = {
        transformations: {
          status: RdiDyRunJobStatus.Success,
        },
        commands: {
          status: RdiDyRunJobStatus.Success,
        },
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await client.dryRunJob(mockRdiDryRunJob);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        RdiUrl.DryRunJob,
        mockRdiDryRunJob,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the client call fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.dryRunJob(mockRdiDryRunJob)).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('testConnections', () => {
    const config = { sources: { source1: {} } };

    it('should return a successful response', async () => {
      const expectedTargetsResponse = {
        targets: {
          target: {
            status: 'success',
          },
        },
      };
      const expectedSourcesResponse = {
        source1: {
          connected: true,
          error: '',
        },
      };

      const targetsResponses = [{ data: expectedTargetsResponse }];

      const sourcesResponses = [{ data: expectedSourcesResponse.source1 }];

      mockedAxios.post.mockImplementation(
        createMockPostImplementation(targetsResponses, sourcesResponses),
      );

      const response = await client.testConnections(config);

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);

      expect(response).toEqual({
        sources: expectedSourcesResponse,
        ...expectedTargetsResponse,
      });
    });

    it('should return a successful response with multiple sources', async () => {
      const expectedTargetsResponse = {
        targets: {
          target: {
            status: 'success',
          },
        },
      };

      const expectedSourcesResponse = {
        source1: {
          connected: true,
          error: '',
        },
        source2: {
          connected: false,
          error: 'Connection failed',
        },
      };

      const targetsResponses = [{ data: expectedTargetsResponse }];

      const sourcesResponses = [
        { data: { connected: true, error: '' } },
        { data: { connected: false, error: 'Connection failed' } },
      ];

      mockedAxios.post.mockImplementation(
        createMockPostImplementation(targetsResponses, sourcesResponses),
      );

      const response = await client.testConnections({
        sources: {
          source1: {},
          source2: {},
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);

      expect(response).toEqual({
        sources: expectedSourcesResponse,
        ...expectedTargetsResponse,
      });
    });

    it('should throw an error if the requests fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.testConnections(config)).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        RdiUrl.TestTargetsConnections,
        config,
      );
    });

    it('should return targets when single source test fails', async () => {
      const expectedTargetsResponse = {
        targets: { target1: { status: 'success' } },
      };

      const loggerErrorSpy = jest
        .spyOn(client['logger'], 'error')
        .mockImplementation();

      const targetsResponses = [{ data: expectedTargetsResponse }];

      const sourcesResponses = [new Error('Sources request failed')];

      mockedAxios.post.mockImplementation(
        createMockPostImplementation(targetsResponses, sourcesResponses),
      );

      const response = await client.testConnections(config);

      expect(response).toEqual({
        targets: expectedTargetsResponse.targets,
        sources: {
          source1: {
            connected: false,
            error: 'Failed to test source connection.',
          },
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      loggerErrorSpy.mockRestore();
    });

    it('should return targets when one of multiple source tests fails', async () => {
      const expectedTargetsResponse = {
        targets: { target1: { status: 'success' } },
      };

      const loggerErrorSpy = jest
        .spyOn(client['logger'], 'error')
        .mockImplementation();

      const targetsResponses = [{ data: expectedTargetsResponse }];

      const sourcesResponses = [
        { data: { connected: true, error: '' } },
        new Error('Sources request failed'),
      ];

      mockedAxios.post.mockImplementation(
        createMockPostImplementation(targetsResponses, sourcesResponses),
      );

      const response = await client.testConnections({
        sources: {
          source1: {},
          source2: {},
        },
      });

      expect(response).toEqual({
        targets: expectedTargetsResponse.targets,
        sources: {
          source1: { connected: true, error: '' },
          source2: {
            connected: false,
            error: 'Failed to test source connection.',
          },
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      loggerErrorSpy.mockRestore();
    });

    it('should map 405 to the friendly message for a single source', async () => {
      const expectedTargetsResponse = {
        targets: { target1: { status: 'success' } },
      };

      mockedAxios.post
        .mockResolvedValueOnce({ data: expectedTargetsResponse }) // TestTargetsConnections
        .mockRejectedValueOnce(axiosError(405)); // TestSourcesConnections

      const response = await client.testConnections({
        sources: { source1: {} },
      });

      expect(response).toEqual({
        targets: expectedTargetsResponse.targets,
        sources: {
          source1: {
            connected: false,
            error:
              'Testing source connections is not supported in your RDI version. Please upgrade to version 1.6.0 or later.',
          },
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should map the 405 only to the failing source among multiple sources', async () => {
      const expectedTargetsResponse = {
        targets: { target1: { status: 'success' } },
      };

      mockedAxios.post
        .mockResolvedValueOnce({ data: expectedTargetsResponse }) // TestTargetsConnections
        .mockResolvedValueOnce({ data: { connected: true, error: '' } }) // source1 OK
        .mockRejectedValueOnce(axiosError(405)); // source2 405

      const response = await client.testConnections({
        sources: { source1: {}, source2: {} },
      });

      expect(response).toEqual({
        targets: expectedTargetsResponse.targets,
        sources: {
          source1: { connected: true, error: '' },
          source2: {
            connected: false,
            error:
              'Testing source connections is not supported in your RDI version. Please upgrade to version 1.6.0 or later.',
          },
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed non-405 and 405 source failures', async () => {
      const expectedTargetsResponse = {
        targets: { target1: { status: 'success' } },
      };

      mockedAxios.post
        .mockResolvedValueOnce({ data: expectedTargetsResponse }) // targets
        .mockRejectedValueOnce(axiosError(500, 'Internal error')) // source1 500
        .mockRejectedValueOnce(axiosError(405)); // source2 405

      const response = await client.testConnections({
        sources: { source1: {}, source2: {} },
      });

      expect(response).toEqual({
        targets: expectedTargetsResponse.targets,
        sources: {
          source1: {
            connected: false,
            error: 'Failed to test source connection.',
          },
          source2: {
            connected: false,
            error:
              'Testing source connections is not supported in your RDI version. Please upgrade to version 1.6.0 or later.',
          },
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('getPipelineStatus', () => {
    it('should return pipeline status when API call is successful', async () => {
      const mockApiResponse = {
        data: {
          pipelines: {
            default: {
              status: 'ready',
              state: 'cdc',
            },
          },
          components: {
            processor: { status: 'ready', version: '1.0.0' },
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      const result = await client.getPipelineStatus();

      // Expect transformed response format
      expect(result).toEqual({
        status: 'ready',
        state: 'cdc',
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetPipelineStatus);
    });

    it('should throw an error when API call fails', async () => {
      mockedAxios.get.mockRejectedValue(mockRdiUnauthorizedError);

      await expect(client.getPipelineStatus()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetPipelineStatus);
    });
  });

  describe('getStatistics', () => {
    it('should return success status and transformed data when API call succeeds', async () => {
      const mockApiResponse = {
        rdi_pipeline_status: {
          rdi_version: '1.0.0',
          address: 'redis://localhost:6379',
          run_status: 'running',
          sync_mode: 'streaming',
        },
        processing_performance: {
          total_batches: 100,
          batch_size_avg: 1.5,
          process_time_avg: 50,
          ack_time_avg: 0.5,
          read_time_avg: 10,
          rec_per_sec_avg: 1000,
          total_time_avg: 60,
        },
        connections: {},
        data_streams: { totals: {}, streams: {} },
        clients: {},
        offsets: {},
        snapshot_status: 'completed',
      };
      mockedAxios.get.mockResolvedValue({ data: mockApiResponse });

      const result = await client.getStatistics();

      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetStatistics);
      expect(result.status).toBe(RdiStatisticsStatus.Success);
      expect(result.data).toBeDefined();
      // 2 sections: General info, Processing performance
      // (Target Connections, Data Streams, and Clients are filtered out because they have empty data)
      expect(result.data.sections).toHaveLength(2);
    });

    it('should return fail status and error message when API call fails', async () => {
      mockedAxios.get.mockRejectedValue(mockRdiUnauthorizedError);

      const result = await client.getStatistics();

      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.GetStatistics);
      expect(result.status).toBe(RdiStatisticsStatus.Fail);
      expect(result.error).toBe(mockRdiUnauthorizedError.message);
    });
  });

  describe('getJobFunctions', () => {
    it('should return job functions', async () => {
      const expectedResponse = { jobFunctions: ['jobFunc1', 'jobFunc2'] };
      mockedAxios.get.mockResolvedValueOnce({ data: expectedResponse });

      const response = await client.getJobFunctions();

      expect(mockedAxios.get).toHaveBeenCalledWith(RdiUrl.JobFunctions);
      expect(response).toEqual(expectedResponse);
    });

    it('should throw an error if the API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.getJobFunctions()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('connect', () => {
    it('should set auth and authorization headers on successful login', async () => {
      const mockedAccessToken = sign(
        { exp: Math.trunc(Date.now() / 1000) + 3600 },
        'test',
      );
      const expectedAuthorizationHeader = `Bearer ${mockedAccessToken}`;

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {
          access_token: mockedAccessToken,
        },
      });

      await client.connect();

      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.Login, {
        username: mockRdi.username,
        password: mockRdi.password,
      });

      expect(client['auth']['jwt']).toEqual(mockedAccessToken);
      expect(mockedAxios.defaults.headers.common['Authorization']).toEqual(
        expectedAuthorizationHeader,
      );
    });

    it('should set dummy authorization headers in dev mode when login is disabled', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        status: 404,
      });

      await client.connect();

      expect(mockedAxios.post).toHaveBeenCalledWith(RdiUrl.Login, {
        username: mockRdi.username,
        password: mockRdi.password,
      });

      expect(client['auth']['jwt']).toEqual(expect.any(String));
      expect(mockedAxios.defaults.headers.common['Authorization']).toEqual(
        `Bearer ${client['auth']['jwt']}`,
      );
    });

    it('should throw an error if login fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(client.connect()).rejects.toThrow(
        mockRdiUnauthorizedError.message,
      );
    });
  });

  describe('ensureAuth', () => {
    let connectSpy: jest.SpyInstance;

    beforeEach(() => {
      connectSpy = jest.spyOn(client, 'connect').mockResolvedValue(undefined);
    });

    it('should not call connect if token is not expired', async () => {
      const exp = Math.trunc(Date.now() / 1000 + TOKEN_THRESHOLD + 3600);
      const mockedAccessToken = sign({ exp }, 'test');
      client['auth'] = { exp, jwt: mockedAccessToken };
      await client.ensureAuth();
      expect(connectSpy).not.toHaveBeenCalled();
    });

    it('should call connect if token is expired', async () => {
      const exp = Math.trunc(Date.now() / 1000 - 3600);
      const mockedAccessToken = sign({ exp }, 'test');
      client['auth'] = { exp, jwt: mockedAccessToken };
      await client.ensureAuth();
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('pollActionStatus', () => {
    const responseData = 'some data';
    const actionId = 'test-action-id';

    it('should return response data on success', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 'completed', data: responseData },
      });

      const result = await client['pollActionStatus'](
        actionId,
        PipelineActions.Deploy,
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${RdiUrl.Action}/${actionId}`,
        { signal: undefined },
      );
      expect(result).toEqual(responseData);
    });

    it('should throw an error if action status is failed', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 'failed', error: { message: 'Test error' } },
      });

      await expect(
        client['pollActionStatus'](actionId, PipelineActions.Deploy),
      ).rejects.toThrow('Test error');
    });

    it('should throw an error if an error occurs during polling', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockRdiUnauthorizedError);

      await expect(
        client['pollActionStatus'](actionId, PipelineActions.Deploy),
      ).rejects.toThrow(mockRdiUnauthorizedError.message);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${RdiUrl.Action}/${actionId}`,
        { signal: undefined },
      );
    });
  });
});
