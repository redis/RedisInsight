import { mockSshOptionsBasic, mockSshOptionsPrivateKey } from 'src/__mocks__';
import * as utils from 'src/common/utils';
import { Test, TestingModule } from '@nestjs/testing';
import { SshImportService } from 'src/modules/database-import/ssh-import.service';
import {
  InvalidSshPrivateKeyBodyException,
  InvalidSshBodyException,
  SshAgentsAreNotSupportedException,
} from 'src/modules/database-import/exceptions';

jest.mock('src/common/utils', () => ({
  ...(jest.requireActual('src/common/utils') as object),
  getPemBodyFromFileSync: jest.fn(),
}));

const mockSshImportDataBasic = {
  sshHost: mockSshOptionsBasic.host,
  sshPort: mockSshOptionsBasic.port,
  sshUsername: mockSshOptionsBasic.username,
  sshPassword: mockSshOptionsBasic.password,
};

const mockSshImportDataPK = {
  ...mockSshImportDataBasic,
  sshPrivateKey: mockSshOptionsPrivateKey.privateKey,
  sshPassphrase: mockSshOptionsPrivateKey.passphrase,
};

describe('SshImportService', () => {
  let service: SshImportService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SshImportService],
    }).compile();

    service = await module.get(SshImportService);
  });

  let getPemBodyFromFileSyncSpy;

  describe('processSshOptions', () => {
    beforeEach(() => {
      getPemBodyFromFileSyncSpy = jest.spyOn(
        utils as any,
        'getPemBodyFromFileSync',
      );
      getPemBodyFromFileSyncSpy.mockReturnValue(
        mockSshOptionsPrivateKey.privateKey,
      );
    });

    it('should successfully process ssh basic', async () => {
      const response = await service.processSshOptions({
        ...mockSshImportDataBasic,
      });

      expect(response).toEqual({
        ...mockSshOptionsBasic,
        id: undefined,
        privateKey: undefined,
        passphrase: undefined,
      });
    });

    it('should successfully process ssh PKP', async () => {
      const response = await service.processSshOptions({
        ...mockSshImportDataPK,
      });

      expect(response).toEqual({
        ...mockSshOptionsPrivateKey,
        id: undefined,
        password: undefined,
      });
    });

    it('should successfully process ssh PKP (from path)', async () => {
      const response = await service.processSshOptions({
        ...mockSshImportDataPK,
        sshPrivateKey: '/some/path',
      });

      expect(response).toEqual({
        ...mockSshOptionsPrivateKey,
        id: undefined,
        password: undefined,
      });
    });

    it('should throw an error when invalid privateKey body provided', async () => {
      getPemBodyFromFileSyncSpy.mockImplementation(() => {
        throw new Error('no file');
      });

      try {
        await service.processSshOptions({
          ...mockSshImportDataPK,
          sshPrivateKey: '/some/path',
        });
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidSshPrivateKeyBodyException);
      }
    });

    it('should throw an error when ssh agent provided', async () => {
      try {
        await service.processSshOptions({
          ...mockSshImportDataPK,
          sshAgentPath: '/agent/path',
        });
      } catch (e) {
        expect(e).toBeInstanceOf(SshAgentsAreNotSupportedException);
      }
    });
  });

  it('should throw an error when no username defined', async () => {
    try {
      await service.processSshOptions({
        ...mockSshImportDataPK,
        sshUsername: undefined,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidSshBodyException);
    }
  });

  it('should throw an error when no port defined', async () => {
    try {
      await service.processSshOptions({
        ...mockSshImportDataPK,
        sshPassword: undefined,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidSshBodyException);
    }
  });
});
