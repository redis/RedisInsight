import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDataToEncrypt,
  mockEncryptionKey,
  mockEncryptResult,
  mockKeyEncryptResult,
} from 'src/__mocks__';
import {
  KeyDecryptionErrorException,
  KeyEncryptionErrorException,
  KeyUnavailableException,
} from 'src/modules/encryption/exceptions';
import { KeyEncryptionStrategy } from 'src/modules/encryption/strategies/key-encryption.strategy';

describe('KeyEncryptionStrategy', () => {
  let service: KeyEncryptionStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyEncryptionStrategy],
    }).compile();

    service = module.get(KeyEncryptionStrategy);
    // @ts-ignore
    service['key'] = mockEncryptionKey;
  });

  describe('isAvailable', () => {
    it('Should return true when env specified', async () => {
      expect(await service.isAvailable()).toEqual(true);
    });

    it('Should return false when env is not specified', async () => {
      // @ts-ignore
      service['key'] = undefined;

      expect(await service.isAvailable()).toEqual(false);
    });
  });

  describe('encrypt', () => {
    it('Should encrypt data', async () => {
      expect(service['cipherKey']).toEqual(undefined);
      expect(await service.encrypt(mockDataToEncrypt)).toEqual(
        mockKeyEncryptResult,
      );
      expect(service['cipherKey']).not.toEqual(undefined);
    });
    it('Should throw KeyEncryptionError when unable to encrypt', async () => {
      await expect(service.encrypt(null)).rejects.toThrowError(
        KeyEncryptionErrorException,
      );
    });
    it('Should throw KeyUnavailable when there is no key but we are trying to encrypt', async () => {
      // @ts-ignore
      service['key'] = undefined;

      await expect(service.encrypt(mockDataToEncrypt)).rejects.toThrowError(
        KeyUnavailableException,
      );
    });
  });

  describe('decrypt', () => {
    it('Should decrypt data', async () => {
      expect(service['cipherKey']).toEqual(undefined);
      expect(
        await service.decrypt(
          mockKeyEncryptResult.data,
          mockKeyEncryptResult.encryption,
        ),
      ).toEqual(mockDataToEncrypt);
      expect(service['cipherKey']).not.toEqual(undefined);
    });
    it("Should return null when encryption doesn't match KEY", async () => {
      expect(await service.decrypt(mockEncryptResult.data, 'PLAIN')).toEqual(
        null,
      );
    });
    it('Should throw KeyDecryptionError when unable to decrypt', async () => {
      await expect(
        service.decrypt(null, mockKeyEncryptResult.encryption),
      ).rejects.toThrowError(KeyDecryptionErrorException);
    });
    it('Should throw KeyUnavailable when there is no key but we are trying to decrypt', async () => {
      // @ts-ignore
      service['key'] = undefined;

      await expect(
        service.decrypt(
          mockKeyEncryptResult.data,
          mockKeyEncryptResult.encryption,
        ),
      ).rejects.toThrowError(KeyUnavailableException);
    });
  });
});
