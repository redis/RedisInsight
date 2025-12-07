import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCustomTutorial,
  mockCustomTutorialAdmZipEntry,
  mockCustomTutorialMacosxAdmZipEntry,
  mockCustomTutorialsHttpLink,
  mockCustomTutorialsHttpLink2,
  mockCustomTutorialTmpPath,
  mockCustomTutorialZipFile,
  mockCustomTutorialZipFileAxiosResponse,
} from 'src/__mocks__';
import * as fs from 'fs-extra';
import axios from 'axios';
import { CustomTutorialFsProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.fs.provider';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import AdmZip from 'adm-zip';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';
import { Dirent, Stats } from 'fs';

const PATH_CONFIG = config.get('dir_path');

jest.mock('fs-extra');
const mFs = fs as jest.Mocked<typeof fs>;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockedAdmZip = {
  extractAllTo: jest.fn(),
  getEntries: jest.fn(),
  extractEntryTo: jest.fn(),
} as unknown as jest.Mocked<AdmZip>;

jest.mock('adm-zip', () => jest.fn().mockImplementation(() => mockedAdmZip));

describe('CustomTutorialFsProvider', () => {
  let service: CustomTutorialFsProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mFs);
    jest.mock('adm-zip', () =>
      jest.fn().mockImplementation(() => mockedAdmZip),
    );
    jest.mock('axios', () => mockedAxios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomTutorialFsProvider],
    }).compile();

    service = await module.get(CustomTutorialFsProvider);
  });

  describe('unzipToTmpFolder', () => {
    let prepareTmpFolderSpy;

    beforeEach(() => {
      mockedAxios.get.mockResolvedValueOnce(
        mockCustomTutorialZipFileAxiosResponse,
      );
      mockedAdmZip.getEntries.mockReturnValue([]);
      mFs.ensureDir.mockImplementationOnce(() => Promise.resolve());
      mFs.remove.mockImplementationOnce(() => Promise.resolve());
      mFs.readdir.mockResolvedValue([]);
      prepareTmpFolderSpy = jest.spyOn(
        CustomTutorialFsProvider,
        'prepareTmpFolder',
      );
      prepareTmpFolderSpy.mockResolvedValueOnce(mockCustomTutorialTmpPath);
    });

    describe('unzipFromMemoryStoredFile', () => {
      it('should unzip data', async () => {
        const result = await service.unzipFromMemoryStoredFile(
          mockCustomTutorialZipFile,
        );
        expect(result).toEqual(mockCustomTutorialTmpPath);
        expect(mFs.copy).not.toHaveBeenCalled();
      });
      it('should unzip data into just generated tmp folder', async () => {
        mFs.lstat.mockResolvedValueOnce({ isDirectory: () => true } as Stats);
        mFs.readdir.mockResolvedValue(['singleFolder'] as unknown as Dirent[]);

        prepareTmpFolderSpy.mockRestore();
        const result = await service.unzipFromMemoryStoredFile(
          mockCustomTutorialZipFile,
        );
        expect(result).toContain(
          `${PATH_CONFIG.tmpDir}/Garnetinsight/custom-tutorials`,
        );
        expect(mFs.copy).toHaveBeenCalled();
      });
    });

    describe('unzipFromExternalLink', () => {
      it.each([mockCustomTutorialsHttpLink, mockCustomTutorialsHttpLink2])(
        'should unzip data from external link',
        async (url) => {
          const result = await service.unzipFromExternalLink(url);
          expect(result).toEqual(mockCustomTutorialTmpPath);
        },
      );

      it.each([
        'http://hithub.com',
        'http://raw.githubusercontent.com',
        'http://raw.amy.other.com',
      ])('should unzip data from external link', async (url) => {
        await expect(service.unzipFromExternalLink(url)).rejects.toThrow(
          new BadRequestException(
            ERROR_MESSAGES.CUSTOM_TUTORIAL_UNSUPPORTED_ORIGIN,
          ),
        );
      });

      it('should throw InternalServerError when incorrect external link provided', async () => {
        const responsePayload = {
          response: {
            status: 404,
            data: { message: 'resource not found' },
          },
        };

        mockedAxios.get.mockReset().mockRejectedValueOnce(responsePayload);

        try {
          await service.unzipFromExternalLink(mockCustomTutorialsHttpLink);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(
            ERROR_MESSAGES.CUSTOM_TUTORIAL_UNABLE_TO_FETCH_FROM_EXTERNAL,
          );
        }
      });
    });

    it('should unzip data to particular tmp folder', async () => {
      mockedAdmZip.getEntries.mockReturnValueOnce([
        mockCustomTutorialAdmZipEntry,
        mockCustomTutorialMacosxAdmZipEntry,
      ]);

      const result = await service.unzipToTmpFolder(mockedAdmZip);

      expect(result).toEqual(mockCustomTutorialTmpPath);
      expect(mockedAdmZip.extractEntryTo).toHaveBeenCalledTimes(1);
      expect(mockedAdmZip.extractEntryTo).toHaveBeenCalledWith(
        mockCustomTutorialAdmZipEntry,
        mockCustomTutorialTmpPath,
        true,
        true,
        false,
      );
    });

    it('should throw InternalServerError', async () => {
      mockedAdmZip.getEntries.mockReturnValueOnce([
        mockCustomTutorialAdmZipEntry,
        mockCustomTutorialMacosxAdmZipEntry,
      ]);
      mockedAdmZip.extractEntryTo.mockImplementationOnce(() => {
        throw new Error('Unable to extract file');
      });

      try {
        await service.unzipToTmpFolder(mockedAdmZip);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to extract file');
      }
    });
  });

  describe('moveFolder', () => {
    it('should move folder', async () => {
      mFs.move.mockImplementationOnce(() => Promise.resolve());

      await service.moveFolder(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );

      expect(mFs.pathExists).not.toHaveBeenCalled();
      expect(mFs.remove).not.toHaveBeenCalled();
      expect(mFs.move).toHaveBeenCalledWith(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );
    });

    it('should move folder when there is no such folder in the dest path', async () => {
      mFs.pathExists.mockImplementationOnce(() => Promise.resolve(false));
      mFs.move.mockImplementationOnce(() => Promise.resolve());

      await service.moveFolder(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
        true,
      );

      expect(mFs.pathExists).toHaveBeenCalledWith(
        mockCustomTutorial.absolutePath,
      );
      expect(mFs.remove).not.toHaveBeenCalled();
      expect(mFs.move).toHaveBeenCalledWith(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );
    });

    it('should move folder when and remove existing one before', async () => {
      mFs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
      mFs.remove.mockImplementationOnce(() => Promise.resolve());
      mFs.move.mockImplementationOnce(() => Promise.resolve());

      await service.moveFolder(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
        true,
      );

      expect(mFs.pathExists).toHaveBeenCalledWith(
        mockCustomTutorial.absolutePath,
      );
      expect(mFs.remove).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
      expect(mFs.move).toHaveBeenCalledWith(
        mockCustomTutorialTmpPath,
        mockCustomTutorial.absolutePath,
      );
    });

    it('should throw InternalServerError', async () => {
      mFs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
      mFs.remove.mockImplementationOnce(() => Promise.resolve());
      mFs.move.mockImplementationOnce(() =>
        Promise.reject(new Error('dest folder exists')),
      );

      try {
        await service.moveFolder(
          mockCustomTutorialTmpPath,
          mockCustomTutorial.absolutePath,
          true,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('dest folder exists');
      }
    });
  });

  describe('removeFolder', () => {
    it('should remove folder', async () => {
      mFs.remove.mockResolvedValueOnce();

      await service.removeFolder(mockCustomTutorial.absolutePath);

      expect(mFs.remove).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
    });

    it('should not fail in case of any error', async () => {
      mFs.remove.mockReset().mockRejectedValueOnce(new Error('No file'));

      await service.removeFolder(mockCustomTutorial.absolutePath);

      expect(mFs.remove).toHaveBeenCalledWith(mockCustomTutorial.absolutePath);
    });
  });
});
