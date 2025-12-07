import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockRepository,
  mockServer,
  mockServerEntity,
  MockType,
} from 'src/__mocks__';
import { LocalServerRepository } from 'src/modules/server/repositories/local.server.repository';
import { ServerEntity } from 'src/modules/server/entities/server.entity';

describe('LocalServerRepository', () => {
  let service: LocalServerRepository;
  let repository: MockType<Repository<ServerEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalServerRepository,
        {
          provide: getRepositoryToken(ServerEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(ServerEntity));
    service = await module.get(LocalServerRepository);

    repository.findOneBy.mockResolvedValue(mockServerEntity);
    repository.save.mockResolvedValue(mockServerEntity);
    repository.create.mockReturnValue(new ServerEntity());
  });

  describe('exists', () => {
    it('should return false if entity does not exists in the database', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      expect(await service.exists()).toEqual(false);
    });

    it('should return true if entity exists in the database', async () => {
      expect(await service.exists()).toEqual(true);
    });
  });

  describe('getOrCreate', () => {
    it("should create server entity if it doesn't exists before", async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      expect(await service.getOrCreate()).toEqual(mockServer);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should get existing server', async () => {
      expect(await service.exists()).toEqual(true);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
