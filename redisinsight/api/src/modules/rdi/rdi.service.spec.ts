import { Test, TestingModule } from '@nestjs/testing';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { RdiAnalytics } from 'src/modules/rdi/rdi.analytics';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { CreateRdiDto, UpdateRdiDto } from 'src/modules/rdi/dto';
import { Rdi, RdiClientMetadata } from 'src/modules/rdi/models';
import {
  MockType,
  mockRdi,
  mockRdiAnalytics,
  mockRdiClientFactory,
  mockRdiClientProvider,
  mockRdiRepository,
  mockSessionMetadata,
} from 'src/__mocks__';
import { AxiosError } from 'axios';
import { wrapRdiPipelineError } from './exceptions';
import { RdiService } from './rdi.service';

describe('RdiService', () => {
  let service: RdiService;
  let repository: MockType<RdiRepository>;
  let analytics: MockType<RdiAnalytics>;
  let rdiClientProvider: MockType<RdiClientProvider>;
  let rdiClientFactory: MockType<RdiClientFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RdiService,
        {
          provide: RdiRepository,
          useFactory: mockRdiRepository,
        },
        {
          provide: RdiAnalytics,
          useFactory: mockRdiAnalytics,
        },
        {
          provide: RdiClientProvider,
          useFactory: mockRdiClientProvider,
        },
        {
          provide: RdiClientFactory,
          useFactory: mockRdiClientFactory,
        },
      ],
    }).compile();

    service = module.get(RdiService);
    repository = module.get(RdiRepository);
    analytics = module.get(RdiAnalytics);
    rdiClientProvider = module.get(RdiClientProvider);
    rdiClientFactory = module.get(RdiClientFactory);
  });

  describe('list', () => {
    it('should return a list of Rdi instances', async () => {
      const rd1 = new Rdi();
      const rd2 = new Rdi();

      repository.list.mockResolvedValue([rd1, rd2]);
      const result = await service.list();

      expect(result).toEqual([rd1, rd2]);
    });
  });

  describe('get', () => {
    it('should return an Rdi instance by id', async () => {
      const rd = new Rdi();
      repository.get.mockResolvedValue(rd);

      const result = await service.get('123');

      expect(result).toEqual(rd);
    });

    it('should throw an error if Rdi instance is not found', async () => {
      repository.get.mockResolvedValue(undefined);

      await expect(service.get('123')).rejects.toThrowError(
        'RDI with id 123 was not found',
      );
    });
  });

  describe('update', () => {
    const rdiClientMetadata: RdiClientMetadata = {
      id: '123',
      sessionMetadata: undefined,
    };
    it('should update an Rdi instance', async () => {
      const oldRd = Object.assign(new Rdi(), mockRdi);
      const newRd = Object.assign(new Rdi(), {
        ...mockRdi,
        name: 'Updated name',
      });
      const dto: UpdateRdiDto = Object.assign(new UpdateRdiDto(), {
        name: 'Updated name',
      });
      repository.get.mockResolvedValue(oldRd);
      repository.update.mockResolvedValue(newRd);
      rdiClientFactory.createClient.mockResolvedValue(undefined);
      rdiClientProvider.deleteManyByRdiId.mockResolvedValue(undefined);

      const result = await service.update(rdiClientMetadata, dto);

      expect(repository.get).toHaveBeenCalledWith(rdiClientMetadata.id);
      expect(repository.update).toHaveBeenCalledWith(
        rdiClientMetadata.id,
        newRd,
      );
      expect(result).toEqual(newRd);
    });

    it('should create a client and delete rdis if updating connectionFields', async () => {
      const oldRd = Object.assign(new Rdi(), mockRdi);
      const dto: UpdateRdiDto = Object.assign(
        new UpdateRdiDto(),
        RdiService.connectionFields.reduce((res, key) => {
          res[key] = 'updated';
          return res;
        }, {}),
      );
      const newRd = Object.assign(new Rdi(), {
        ...mockRdi,
        ...dto,
      });
      repository.get.mockResolvedValue(oldRd);
      repository.update.mockResolvedValue(newRd);
      rdiClientFactory.createClient.mockResolvedValue(undefined);
      rdiClientProvider.deleteManyByRdiId.mockResolvedValue(undefined);

      await service.update(rdiClientMetadata, dto);

      expect(RdiService.isConnectionAffected(dto)).toBeTruthy();
      expect(rdiClientFactory.createClient).toHaveBeenCalledWith(
        rdiClientMetadata,
        newRd,
      );
      expect(rdiClientProvider.deleteManyByRdiId).toHaveBeenCalledWith(
        rdiClientMetadata.id,
      );
    });

    it('should throw an error if update fails', async () => {
      const oldRd = Object.assign(new Rdi(), mockRdi);
      const dto: UpdateRdiDto = Object.assign(new UpdateRdiDto(), {
        name: 'Updated name',
      });
      const error = new AxiosError('Update failed');
      repository.get.mockResolvedValue(oldRd);
      repository.update.mockRejectedValue(error);
      rdiClientFactory.createClient.mockResolvedValue(undefined);
      rdiClientProvider.deleteManyByRdiId.mockResolvedValue(undefined);

      await expect(service.update(rdiClientMetadata, dto)).rejects.toThrowError(
        wrapRdiPipelineError(error),
      );
    });
  });

  describe('create', () => {
    const validGetVersion = () => Promise.resolve('test-version');

    it('should create an Rdi instance', async () => {
      const dto: CreateRdiDto = {
        name: 'name',
        url: 'http://localhost:4000',
        password: 'pass',
        username: 'user',
      };
      repository.create.mockResolvedValue(mockRdi);
      rdiClientFactory.createClient.mockReturnValue({
        getVersion: validGetVersion,
      });

      const result = await service.create(mockSessionMetadata, dto);

      expect(result.name).toEqual(dto.name);
      expect(rdiClientFactory.createClient).toHaveBeenCalledWith(
        { sessionMetadata: mockSessionMetadata, id: expect.any(String) },
        expect.any(Rdi),
      );
    });

    it('should throw an error if create fails', async () => {
      const dto: CreateRdiDto = {
        name: 'name',
        url: 'http://localhost:4000',
        password: 'pass',
        username: 'user',
      };
      const error = new AxiosError('Create failed');
      repository.create.mockRejectedValue(error);
      rdiClientFactory.createClient.mockRejectedValue(error);

      await expect(
        service.create(mockSessionMetadata, dto),
      ).rejects.toThrowError(wrapRdiPipelineError(error));
    });

    it('should get the RDI version', async () => {
      const dto: CreateRdiDto = {
        name: 'name',
        url: 'http://localhost:4000',
        password: 'pass',
        username: 'user',
      };

      repository.create.mockResolvedValue(mockRdi);
      rdiClientFactory.createClient.mockReturnValue({
        getVersion: validGetVersion,
      });

      await service.create(mockSessionMetadata, dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 'test-version',
        }),
      );
    });

    it('should get the default RDI version when getVersion fails', async () => {
      const dto: CreateRdiDto = {
        name: 'name',
        url: 'http://localhost:4000',
        password: 'pass',
        username: 'user',
      };

      repository.create.mockResolvedValue(mockRdi);
      rdiClientFactory.createClient.mockResolvedValue({
        getVersion: () => Promise.reject(new Error('Version not available')),
      });

      await expect(service.create(mockSessionMetadata, dto)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete Rdi instances', async () => {
      const ids = ['123', '456'];
      repository.delete.mockResolvedValue(undefined);
      rdiClientProvider.deleteManyByRdiId.mockResolvedValue(undefined);
      jest
        .spyOn(analytics, 'sendRdiInstanceDeleted')
        .mockResolvedValue(undefined as never);

      await service.delete(mockSessionMetadata, ids);

      expect(repository.delete).toHaveBeenCalledWith(ids);
      expect(rdiClientProvider.deleteManyByRdiId).toHaveBeenCalledWith(ids[0]);
      expect(rdiClientProvider.deleteManyByRdiId).toHaveBeenCalledWith(ids[1]);
      expect(analytics.sendRdiInstanceDeleted).toHaveBeenCalledWith(
        mockSessionMetadata,
        ids.length,
      );
    });

    it('should throw an error if delete fails', async () => {
      const ids = ['123', '456'];
      repository.delete.mockRejectedValue(new Error('Delete failed'));
      rdiClientProvider.deleteManyByRdiId.mockRejectedValue(
        new Error('Delete client failed'),
      );
      jest
        .spyOn(analytics, 'sendRdiInstanceDeleted')
        .mockResolvedValue(undefined as never);

      await expect(
        service.delete(mockSessionMetadata, ids),
      ).rejects.toThrowError('Internal Server Error');
      expect(analytics.sendRdiInstanceDeleted).toHaveBeenCalledWith(
        mockSessionMetadata,
        ids.length,
        expect.any(String),
      );
    });
  });

  describe('connect', () => {
    it('should connect to an Rdi instance', async () => {
      const rdiClientMetadata: RdiClientMetadata = {
        id: '123',
        sessionMetadata: undefined,
      };
      rdiClientProvider.getOrCreate.mockResolvedValue(undefined);

      await service.connect(rdiClientMetadata);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        rdiClientMetadata,
      );
    });

    it('should throw an error if connection fails', async () => {
      const rdiClientMetadata: RdiClientMetadata = {
        id: '123',
        sessionMetadata: undefined,
      };
      const error = new AxiosError('Connection failed');
      rdiClientProvider.getOrCreate.mockRejectedValue(error);

      await expect(service.connect(rdiClientMetadata)).rejects.toThrowError(
        wrapRdiPipelineError(error),
      );
    });
  });
});
