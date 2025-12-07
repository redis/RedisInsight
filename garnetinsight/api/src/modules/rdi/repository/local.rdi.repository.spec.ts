import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { RdiEntity } from 'src/modules/rdi/entities/rdi.entity';
import {
  MockType,
  mockEncryptionService,
  mockRdi,
  mockRdiDecrypted,
  mockRdiEntityEncrypted,
  mockRdiPasswordEncrypted,
  mockRdiPasswordPlain,
  mockRepository,
} from 'src/__mocks__';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { LocalRdiRepository } from './local.rdi.repository';

describe('LocalRdiRepository', () => {
  let repository: LocalRdiRepository;
  let rdiEntityRepository: MockType<Repository<RdiEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalRdiRepository,
        {
          provide: getRepositoryToken(RdiEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    repository = module.get(LocalRdiRepository);
    rdiEntityRepository = module.get(getRepositoryToken(RdiEntity));
    encryptionService = module.get(EncryptionService);

    when(encryptionService.decrypt)
      .calledWith(mockRdiPasswordEncrypted, expect.anything())
      .mockResolvedValue(mockRdiPasswordPlain);

    when(encryptionService.encrypt)
      .calledWith(mockRdiPasswordPlain)
      .mockResolvedValue({
        data: mockRdiPasswordEncrypted,
        encryption: EncryptionStrategy.KEYTAR,
      });
  });

  describe('get', () => {
    it('should return null if entity is not found', async () => {
      rdiEntityRepository.findOneBy.mockResolvedValueOnce(null);

      const result = await repository.get('1');

      expect(result).toBeNull();
    });

    it('should return decrypted Rdi entity', async () => {
      rdiEntityRepository.findOneBy.mockResolvedValueOnce(
        mockRdiEntityEncrypted,
      );

      const result = await repository.get(mockRdiEntityEncrypted.id);

      expect(result).toEqual(mockRdiDecrypted);
    });

    it('should return decrypted Rdi entity even if decryption fails and ignoreEncryptionErrors is true', async () => {
      rdiEntityRepository.findOneBy.mockResolvedValueOnce(
        mockRdiEntityEncrypted,
      );
      encryptionService.decrypt.mockRejectedValueOnce(new Error());

      const result = await repository.get(mockRdiEntityEncrypted.id, true);

      expect(result?.id).toEqual(mockRdiEntityEncrypted.id);
    });
  });

  describe('list', () => {
    it('should return list of Rdi entities', async () => {
      const encryptedEntities = [
        Object.assign(new RdiEntity(), { ...mockRdi, id: '1' }),
        Object.assign(new RdiEntity(), { ...mockRdi, id: '2' }),
      ];

      const rdis = [
        { ...mockRdi, id: '1' },
        { ...mockRdi, id: '2' },
      ];

      jest
        .spyOn(rdiEntityRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValueOnce(encryptedEntities),
        } as any);

      const result = await repository.list();

      expect(result).toEqual([rdis[0], rdis[1]]);
    });
  });

  describe('create', () => {
    it('should create and return decrypted Rdi entity', async () => {
      jest
        .spyOn(rdiEntityRepository, 'save')
        .mockReturnValueOnce(mockRdiEntityEncrypted);
      const result = await repository.create(mockRdiDecrypted);

      expect(result).toEqual(mockRdiDecrypted);
    });
  });

  describe('update', () => {
    it('should update and return decrypted Rdi entity', async () => {
      rdiEntityRepository.findOneBy.mockResolvedValue(mockRdiEntityEncrypted);
      rdiEntityRepository.merge.mockReturnValue(mockRdiDecrypted);
      rdiEntityRepository.save.mockResolvedValue(mockRdiEntityEncrypted);

      const result = await repository.update('1', mockRdiDecrypted);

      expect(result).toEqual(mockRdiDecrypted);
    });
  });

  describe('delete', () => {
    it('should delete entities', async () => {
      rdiEntityRepository.delete.mockResolvedValueOnce(undefined);

      const res = await repository.delete(['1', '2']);

      expect(rdiEntityRepository.delete).toHaveBeenCalledWith(['1', '2']);
      expect(res).toEqual(undefined);
    });
  });
});
