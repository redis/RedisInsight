import { Test, TestingModule } from '@nestjs/testing';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { RdiClientStorage } from 'src/modules/rdi/providers/rdi.client.storage';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { NotFoundException } from '@nestjs/common';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import {
  MockType,
  generateMockRdiClient,
  mockRdi,
  mockRdiClientFactory,
  mockRdiClientStorage,
  mockRdiRepository,
} from 'src/__mocks__';
import { RdiClientProvider } from './rdi.client.provider';

describe('RdiClientProvider', () => {
  let provider: RdiClientProvider;
  let repository: MockType<RdiRepository>;
  let rdiClientStorage: MockType<RdiClientStorage>;
  let rdiClientFactory: MockType<RdiClientFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RdiClientProvider,
        {
          provide: RdiRepository,
          useFactory: mockRdiRepository,
        },
        {
          provide: RdiClientStorage,
          useFactory: mockRdiClientStorage,
        },
        {
          provide: RdiClientFactory,
          useFactory: mockRdiClientFactory,
        },
      ],
    }).compile();

    provider = module.get(RdiClientProvider);
    repository = module.get(RdiRepository);
    rdiClientStorage = module.get(RdiClientStorage);
    rdiClientFactory = module.get(RdiClientFactory);
  });

  describe('getOrCreate', () => {
    it('should return existing client if found', async () => {
      const metadata: RdiClientMetadata = {
        id: '123',
        sessionMetadata: undefined,
      };
      const client: RdiClient = generateMockRdiClient(metadata);
      rdiClientStorage.getByMetadata.mockResolvedValue(client);
      repository.update.mockResolvedValue(mockRdi);

      const result = await provider.getOrCreate(metadata);

      expect(rdiClientStorage.getByMetadata).toHaveBeenCalledWith(metadata);
      expect(client.ensureAuth).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
      expect(result).toEqual(client);
    });

    it('should create and return new client if not found', async () => {
      const metadata: RdiClientMetadata = {
        id: '124',
        sessionMetadata: undefined,
      };
      const client: RdiClient = generateMockRdiClient(metadata);
      repository.get.mockResolvedValue(mockRdi);
      rdiClientFactory.createClient.mockResolvedValue(client);
      rdiClientStorage.set.mockResolvedValue(client);

      const result = await provider.getOrCreate(metadata);

      expect(repository.get).toHaveBeenCalledWith(metadata.id);
      expect(rdiClientFactory.createClient).toHaveBeenCalledWith(
        metadata,
        mockRdi,
      );
      expect(rdiClientStorage.set).toHaveBeenCalledWith(client);
      expect(result).toEqual(client);
    });
  });

  describe('create', () => {
    it('should throw NotFoundException if RDI not found', async () => {
      const metadata: RdiClientMetadata = {
        id: '123',
        sessionMetadata: undefined,
      };
      repository.get.mockResolvedValue(null);

      await expect(provider.create(metadata)).rejects.toThrowError(
        NotFoundException,
      );
      expect(repository.get).toHaveBeenCalledWith(metadata.id);
    });

    it('should create and return new client if RDI found', async () => {
      const metadata: RdiClientMetadata = {
        id: '123',
        sessionMetadata: undefined,
      };
      const client: RdiClient = generateMockRdiClient(metadata);
      repository.get.mockResolvedValue(mockRdi);
      rdiClientFactory.createClient.mockResolvedValue(client);
      repository.update.mockResolvedValue(mockRdi);

      const result = await provider.create(metadata);

      expect(repository.get).toHaveBeenCalledWith(metadata.id);
      expect(rdiClientFactory.createClient).toHaveBeenCalledWith(
        metadata,
        mockRdi,
      );
      expect(repository.update).toHaveBeenCalled();
      expect(result).toEqual(client);
    });
  });

  describe('delete', () => {
    it('should delete client by metadata id', async () => {
      const metadata: RdiClientMetadata = {
        id: '123',
        sessionMetadata: undefined,
      };
      rdiClientStorage.delete.mockResolvedValue(1);

      const result = await provider.delete(metadata);

      expect(rdiClientStorage.delete).toHaveBeenCalledWith(metadata.id);
      expect(result).toEqual(1);
    });
  });

  describe('deleteById', () => {
    it('should delete client by id', async () => {
      const id = '123';
      rdiClientStorage.delete.mockResolvedValue(1);

      const result = await provider.deleteById(id);

      expect(rdiClientStorage.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(1);
    });
  });

  describe('deleteManyByRdiId', () => {
    it('should delete clients by RDI id', async () => {
      const id = '123';
      rdiClientStorage.deleteManyByRdiId.mockResolvedValue(2);

      const result = await provider.deleteManyByRdiId(id);

      expect(rdiClientStorage.deleteManyByRdiId).toHaveBeenCalledWith(id);
      expect(result).toEqual(2);
    });
  });

  describe('updateLastConnection', () => {
    it('should update rdi lastConnection', async () => {
      const metadata: RdiClientMetadata = {
        id: '123',
        sessionMetadata: undefined,
      };
      repository.update.mockResolvedValue(mockRdi);

      await provider['updateLastConnection'](metadata);

      expect(repository.update).toHaveBeenCalled();
    });
  });
});
