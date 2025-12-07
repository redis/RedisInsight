import { Test, TestingModule } from '@nestjs/testing';
import { mockDataToEncrypt, mockEncryptResult } from 'src/__mocks__';
import { PlainEncryptionStrategy } from 'src/modules/encryption/strategies/plain-encryption.strategy';
import { EncryptionStrategy } from 'src/modules/encryption/models';

describe('PlainEncryptionStrategy', () => {
  let service: PlainEncryptionStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlainEncryptionStrategy],
    }).compile();

    service = module.get(PlainEncryptionStrategy);
  });

  describe('encrypt', () => {
    it('Should return unencrypted data', async () => {
      expect(await service.encrypt(mockDataToEncrypt)).toEqual({
        data: mockDataToEncrypt,
        encryption: EncryptionStrategy.PLAIN,
      });
    });
  });

  describe('decrypt', () => {
    it('Should return plain data', async () => {
      expect(
        await service.decrypt(mockEncryptResult.data, EncryptionStrategy.PLAIN),
      ).toEqual(mockEncryptResult.data);
    });
    it("Should return null when encryption doesn't match PLAIN", async () => {
      expect(await service.decrypt(mockEncryptResult.data, 'KEYTAR')).toEqual(
        null,
      );
    });
  });
});
