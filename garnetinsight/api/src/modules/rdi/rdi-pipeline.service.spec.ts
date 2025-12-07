import { Test, TestingModule } from '@nestjs/testing';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiPipelineAnalytics } from 'src/modules/rdi/rdi-pipeline.analytics';
import { wrapHttpError } from 'src/common/utils';
import {
  MockType,
  generateMockRdiClient,
  mockRdiClientProvider,
  mockRdiDryRunJob,
  mockRdiPipelineAnalytics,
  mockSessionMetadata,
} from 'src/__mocks__';
import { RdiPipelineService } from './rdi-pipeline.service';
import { RdiDryRunJobDto } from './dto';
import { RdiDyRunJobStatus, RdiPipeline } from './models';

describe('RdiPipelineService', () => {
  let service: RdiPipelineService;
  let rdiClientProvider: MockType<RdiClientProvider>;
  let analytics: MockType<RdiPipelineAnalytics>;
  const rdiClientMetadata = { id: '123', sessionMetadata: mockSessionMetadata };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RdiPipelineService,
        {
          provide: RdiClientProvider,
          useFactory: mockRdiClientProvider,
        },
        {
          provide: RdiPipelineAnalytics,
          useFactory: mockRdiPipelineAnalytics,
        },
      ],
    }).compile();

    service = module.get(RdiPipelineService);
    rdiClientProvider = module.get(RdiClientProvider);
    analytics = module.get(RdiPipelineAnalytics);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSchema', () => {
    it('should call getSchema on the RdiClientProvider and return the result', async () => {
      const schema = { schema: {} };
      const rdiClient = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValueOnce(rdiClient);
      rdiClient.getSchema.mockResolvedValueOnce(schema);

      const result = await service.getSchema(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
      expect(rdiClient.getSchema).toHaveBeenCalled();
      expect(result).toEqual(schema);
    });
  });

  describe('getPipeline', () => {
    it('should call getPipeline on the RdiClientProvider and return the result', async () => {
      const pipeline = { pipeline: {} };
      const rdiClient = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValueOnce(rdiClient);
      rdiClient.getPipeline.mockResolvedValueOnce(pipeline);

      const result = await service.getPipeline(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
      expect(result).toEqual(pipeline);
    });

    it('should call sendRdiPipelineFetched on the RdiPipelineAnalytics if successful', async () => {
      const pipeline = { pipeline: {} };
      const rdiClient = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValueOnce(rdiClient);
      rdiClient.getPipeline.mockResolvedValueOnce(pipeline);

      await service.getPipeline(rdiClientMetadata);

      expect(analytics.sendRdiPipelineFetched).toHaveBeenCalledWith(
        mockSessionMetadata,
        rdiClientMetadata.id,
        pipeline,
      );
    });

    it('should call sendRdiPipelineFetchFailed on the RdiPipelineAnalytics and throw an error if unsuccessful', async () => {
      const error = new Error('Failed to get pipeline');
      rdiClientProvider.getOrCreate.mockRejectedValue(error);

      await expect(service.getPipeline(rdiClientMetadata)).rejects.toThrow(
        wrapHttpError(error),
      );
      expect(analytics.sendRdiPipelineFetchFailed).toHaveBeenCalledWith(
        mockSessionMetadata,
        error,
        rdiClientMetadata.id,
      );
    });
  });

  describe('dryRunJob', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.dryRunJob(rdiClientMetadata, mockRdiDryRunJob);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
    });

    it('should call dryRunJob on the client with the correct dto', async () => {
      const dto = Object.assign(new RdiDryRunJobDto(), {
        input_data: {
          some: 'value',
        },
        job: { name: 'job1' },
      });
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.dryRunJob(rdiClientMetadata, dto);

      expect(client.dryRunJob).toHaveBeenCalledWith(dto);
    });

    it('should return the result of dryRunJob on the client', async () => {
      const rdiClient = generateMockRdiClient(rdiClientMetadata);
      const dto = Object.assign(new RdiDryRunJobDto(), {
        input_data: {
          some: 'value',
        },
        job: { name: 'job1' },
      });
      const response = {
        transformations: {
          status: RdiDyRunJobStatus.Success,
        },
        commands: {
          status: RdiDyRunJobStatus.Success,
        },
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(rdiClient);
      rdiClient.dryRunJob.mockResolvedValueOnce(response);

      const result = await service.dryRunJob(rdiClientMetadata, dto);

      expect(result).toBe(response);
      expect(rdiClient.dryRunJob).toHaveBeenCalledWith(dto);
    });
  });

  describe('deploy', () => {
    const dto = Object.assign(new RdiPipeline(), {
      jobs: { job1: {} },
      config: {},
    });
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = {
        deploy: jest.fn(),
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.deploy(rdiClientMetadata, dto);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
      expect(client.deploy).toHaveBeenCalledWith(dto);
    });

    it('should call deploy on the client with the correct dto', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.deploy(rdiClientMetadata, dto);

      expect(client.deploy).toHaveBeenCalledWith(dto);
    });

    it('should call sendRdiPipelineDeployed on analytics if deploy succeeds', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.deploy(rdiClientMetadata, dto);

      expect(analytics.sendRdiPipelineDeployed).toHaveBeenCalledWith(
        mockSessionMetadata,
        rdiClientMetadata.id,
      );
    });

    it('should call sendRdiPipelineDeployFailed on analytics if deploy fails', async () => {
      const error = new Error('Deploy failed');
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.deploy.mockRejectedValueOnce(error);
      try {
        await service.deploy(rdiClientMetadata, dto);
      } catch (e) {
        expect(analytics.sendRdiPipelineDeployFailed).toHaveBeenCalledWith(
          mockSessionMetadata,
          error,
          rdiClientMetadata.id,
        );
      }
    });

    it('should throw an error if deploy fails', async () => {
      const error = new Error('Deploy failed');
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.deploy.mockRejectedValueOnce(error);

      await expect(service.deploy(rdiClientMetadata, dto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('startPipeline', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = {
        startPipeline: jest.fn(),
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.startPipeline(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
      expect(client.startPipeline).toHaveBeenCalled();
    });

    it('should throw an error if startPipeline fails', async () => {
      const error = new Error('Start Pipeline failed');
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.startPipeline.mockRejectedValueOnce(error);

      await expect(service.startPipeline(rdiClientMetadata)).rejects.toThrow(
        error,
      );
    });
  });

  describe('stopPipeline', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = {
        stopPipeline: jest.fn(),
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.stopPipeline(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
      expect(client.stopPipeline).toHaveBeenCalled();
    });

    it('should throw an error if stopPipeline fails', async () => {
      const error = new Error('Stop Pipeline failed');
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.stopPipeline.mockRejectedValueOnce(error);

      await expect(service.stopPipeline(rdiClientMetadata)).rejects.toThrow(
        error,
      );
    });
  });

  describe('resetPipeline', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = {
        resetPipeline: jest.fn(),
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.resetPipeline(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
      expect(client.resetPipeline).toHaveBeenCalled();
    });

    it('should throw an error if resetPipeline fails', async () => {
      const error = new Error('Stop Pipeline failed');
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.resetPipeline.mockRejectedValueOnce(error);

      await expect(service.resetPipeline(rdiClientMetadata)).rejects.toThrow(
        error,
      );
    });
  });

  describe('testConnections', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const config = { data: 'some data' };
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.testConnections(rdiClientMetadata, config);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
    });

    it('should call testConnections on the client with the correct config', async () => {
      const config = { data: 'some data' };
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.testConnections(rdiClientMetadata, config);

      expect(client.testConnections).toHaveBeenCalledWith(config);
    });

    it('should return the result of testConnections on the client', async () => {
      const config = { data: 'some data' };
      const response = { connected: true };
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.testConnections.mockResolvedValueOnce(response);

      const result = await service.testConnections(rdiClientMetadata, config);

      expect(result).toBe(response);
    });
  });

  describe('getStrategies', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getStrategies(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
    });

    it('should call getStrategies on the client', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getStrategies(rdiClientMetadata);

      expect(client.getStrategies).toHaveBeenCalled();
    });

    it('should return the result of getStrategies on the client', async () => {
      const response = { strategies: [{ id: 1, name: 'Strategy 1' }] };
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.getStrategies.mockResolvedValueOnce(response);

      const result = await service.getStrategies(rdiClientMetadata);

      expect(result).toBe(response);
    });
  });

  describe('getConfigTemplate', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const pipelineType = 'type';
      const dbType = 'type';
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getConfigTemplate(rdiClientMetadata, pipelineType, dbType);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
    });

    it('should call getConfigTemplate on the client with the correct arguments', async () => {
      const pipelineType = 'type';
      const dbType = 'type';
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getConfigTemplate(rdiClientMetadata, pipelineType, dbType);

      expect(client.getConfigTemplate).toHaveBeenCalledWith(
        pipelineType,
        dbType,
      );
    });

    it('should return the result of getConfigTemplate on the client', async () => {
      const pipelineType = 'type';
      const dbType = 'type';
      const response = { template: 'some template' };
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.getConfigTemplate.mockResolvedValue(response);
      const result = await service.getConfigTemplate(
        rdiClientMetadata,
        pipelineType,
        dbType,
      );

      expect(result).toBe(response);
    });
  });

  describe('getPipelineStatus', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getPipelineStatus(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
    });

    it('should call getPipelineStatus on the client', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getPipelineStatus(rdiClientMetadata);

      expect(client.getPipelineStatus).toHaveBeenCalled();
    });

    it('should return the result of getPipelineStatus on the client', async () => {
      const response = { data: { status: 'running' } };
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.getPipelineStatus.mockResolvedValueOnce(response);

      const result = await service.getPipelineStatus(rdiClientMetadata);

      expect(result).toBe(response);
    });
  });

  describe('getJobFunctions', () => {
    it('should call getOrCreate on rdiClientProvider with the correct metadata', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getJobFunctions(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
    });

    it('should call getJobFunctions on the client', async () => {
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);

      await service.getJobFunctions(rdiClientMetadata);

      expect(client.getJobFunctions).toHaveBeenCalled();
    });

    it('should return the result of getJobFunctions on the client', async () => {
      const response = { jobFunctions: ['jobFunc1', 'jobFunc2'] };
      const client = generateMockRdiClient(rdiClientMetadata);
      rdiClientProvider.getOrCreate.mockResolvedValue(client);
      client.getJobFunctions.mockResolvedValueOnce(response);
      const result = await service.getJobFunctions(rdiClientMetadata);

      expect(result).toBe(response);
    });
  });
});
