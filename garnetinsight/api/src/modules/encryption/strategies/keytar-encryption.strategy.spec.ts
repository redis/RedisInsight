import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDataToEncrypt,
  mockEncryptResult,
  mockKeytarModule,
  mockKeytarPassword,
} from 'src/__mocks__';
import { KeytarEncryptionStrategy } from 'src/modules/encryption/strategies/keytar-encryption.strategy';
import {
  KeytarDecryptionErrorException,
  KeytarEncryptionErrorException,
  KeytarUnavailableException,
} from 'src/modules/encryption/exceptions';

describe('KeytarEncryptionStrategy', () => {
  let service: KeytarEncryptionStrategy;
  const keytarModule = mockKeytarModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('keytar', () => keytarModule);
    keytarModule.getPassword.mockReturnValue(mockKeytarPassword);
    keytarModule.setPassword.mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [KeytarEncryptionStrategy],
    }).compile();

    service = module.get(KeytarEncryptionStrategy);
  });

  describe('isAvailable', () => {
    it('Should return true when keytar is available', async () => {
      expect(await service.isAvailable()).toEqual(true);
    });

    it('Should return false when keytar is not available', async () => {
      keytarModule.getPassword.mockRejectedValueOnce(new Error('Some error'));

      expect(await service.isAvailable()).toEqual(false);
    });
  });

  describe('encrypt', () => {
    it('Should encrypt data', async () => {
      expect(await service.encrypt(mockDataToEncrypt)).toEqual(
        mockEncryptResult,
      );

      // check that cached password will be used
      expect(await service.encrypt(mockDataToEncrypt)).toEqual(
        mockEncryptResult,
      );
      expect(mockKeytarModule.getPassword).toHaveBeenCalledTimes(1);
      expect(mockKeytarModule.setPassword).not.toHaveBeenCalled();
    });
    it('Should encrypt + generate and set password when not exists yet', async () => {
      keytarModule.getPassword
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockKeytarPassword);
      keytarModule.setPassword.mockReturnValueOnce(undefined);

      expect(await service.encrypt(mockDataToEncrypt)).toEqual(
        mockEncryptResult,
      );

      expect(mockKeytarModule.setPassword).toHaveBeenCalled();
    });
    it('Should throw KeytarEncryptionError when unable to decrypt', async () => {
      await expect(service.encrypt(null)).rejects.toThrowError(
        KeytarEncryptionErrorException,
      );
    });
    it('Should throw KeytarUnavailable in getPassword error', async () => {
      keytarModule.getPassword.mockRejectedValueOnce(new Error());

      await expect(service.encrypt(mockDataToEncrypt)).rejects.toThrowError(
        KeytarUnavailableException,
      );
    });
    it('Should should throw KeytarUnavailable on setPassword error', async () => {
      keytarModule.getPassword
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockKeytarPassword);
      keytarModule.setPassword.mockRejectedValueOnce(new Error());

      await expect(service.encrypt(mockDataToEncrypt)).rejects.toThrowError(
        KeytarUnavailableException,
      );
    });
  });

  describe('decrypt', () => {
    it('Should decrypt data', async () => {
      expect(
        await service.decrypt(
          mockEncryptResult.data,
          mockEncryptResult.encryption,
        ),
      ).toEqual(mockDataToEncrypt);

      // check that cached password will be used
      expect(
        await service.decrypt(
          mockEncryptResult.data,
          mockEncryptResult.encryption,
        ),
      ).toEqual(mockDataToEncrypt);
      expect(mockKeytarModule.getPassword).toHaveBeenCalledTimes(1);
      expect(mockKeytarModule.setPassword).not.toHaveBeenCalled();
    });
    it("Should return null when encryption doesn't match KEYTAR", async () => {
      expect(await service.decrypt(mockEncryptResult.data, 'PLAIN')).toEqual(
        null,
      );
    });
    it('Should decrypt + generate and set password when not exists yet', async () => {
      keytarModule.getPassword
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockKeytarPassword);
      keytarModule.setPassword.mockReturnValueOnce(undefined);

      expect(
        await service.decrypt(
          mockEncryptResult.data,
          mockEncryptResult.encryption,
        ),
      ).toEqual(mockDataToEncrypt);

      expect(mockKeytarModule.setPassword).toHaveBeenCalled();
    });
    it('Should throw KeytarDecryptionError when unable to decrypt', async () => {
      await expect(
        service.decrypt(null, mockEncryptResult.encryption),
      ).rejects.toThrowError(KeytarDecryptionErrorException);
    });
    it('Should throw KeytarUnavailable in getPassword error', async () => {
      keytarModule.getPassword.mockRejectedValueOnce(new Error());

      await expect(
        service.decrypt(mockEncryptResult.data, mockEncryptResult.encryption),
      ).rejects.toThrowError(KeytarUnavailableException);
    });
    it('Should should throw KeytarUnavailable on setPassword error', async () => {
      keytarModule.getPassword
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockKeytarPassword);
      keytarModule.setPassword.mockRejectedValueOnce(new Error());

      await expect(
        service.decrypt(mockEncryptResult.data, mockEncryptResult.encryption),
      ).rejects.toThrowError(KeytarUnavailableException);
    });
  });
});
