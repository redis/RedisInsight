import { Test, TestingModule } from '@nestjs/testing';
import { CustomTutorialManifestProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.manifest.provider';
import * as fs from 'fs-extra';
import { Dirent, Stats } from 'fs';
import { join } from 'path';
import {
  mockCustomTutorial,
  mockCustomTutorialManifest,
  mockCustomTutorialManifestJson,
} from 'src/__mocks__';
import * as Utils from 'src/utils/path';

jest.mock('fs-extra');
const mFs = fs as jest.Mocked<typeof fs>;

describe('CustomTutorialManifestProvider', () => {
  let service: CustomTutorialManifestProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mFs);

    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomTutorialManifestProvider],
    }).compile();

    service = await module.get(CustomTutorialManifestProvider);
  });

  describe('generateManifestFile', () => {
    it('should return empty manifest for empty folder', async () => {
      mFs.readdir.mockResolvedValueOnce([]);
      mFs.writeFile.mockImplementationOnce(() => Promise.resolve());

      await service['generateManifestFile'](mockCustomTutorial.absolutePath);

      expect(mFs.writeFile).toHaveBeenCalledWith(
        join(mockCustomTutorial.absolutePath, '_manifest.json'),
        JSON.stringify({ children: [] }),
        'utf8',
      );
    });
  });

  describe('getManifestJson', () => {
    it('should return null in case of an error', async () => {
      jest
        .spyOn(service as any, 'getManifestJsonFile')
        .mockRejectedValueOnce(new Error('any error'));

      const result = await service.getManifestJson(
        mockCustomTutorial.absolutePath,
      );

      expect(result).toEqual(null);
    });
  });

  describe('generateManifestEntry', () => {
    it('should return empty array for empty folder', async () => {
      mFs.readdir.mockResolvedValueOnce([]);

      const result = await service['generateManifestEntry'](
        mockCustomTutorial.absolutePath,
      );

      expect(result).toEqual([]);
    });
    it('should return empty array for empty folder', async () => {
      const spy = jest.spyOn(Utils as any, 'winPathToNormalPath');

      // root level entries
      const mockRootLevelEntries = [
        'intro.md',
        '.idea', // should be ignored since starts with .
        'subfolder',
        'manifest.json', // should be ignored since not md file
        '_manifest.json', // should be ignored since starts with _
        '_some.md', // should be ignored since starts with _
      ] as unknown as Dirent[];

      // subfolder entries
      const mockSubFolderEntries = [
        'file.md',
        'file2.md',
        'subsubfolder',
        '.idea', // should be ignored since starts with .
        '_some.md', // should be ignored since starts with _
      ] as unknown as Dirent[];

      const mockSubSubFolderEntries = [
        'file.md',
        'file2.md',
        '.idea', // should be ignored since starts with .
        '_some.md', // should be ignored since starts with _
      ] as unknown as Dirent[];

      mFs.readdir
        .mockResolvedValueOnce(mockRootLevelEntries)
        .mockResolvedValueOnce(mockSubFolderEntries)
        .mockResolvedValueOnce(mockSubSubFolderEntries);

      mFs.lstat
        .mockResolvedValueOnce({ isDirectory: () => false } as Stats) // intro.md
        .mockResolvedValueOnce({ isDirectory: () => true } as Stats) // subfolder/
        .mockResolvedValueOnce({ isDirectory: () => false } as Stats) // subfolder/file.md
        .mockResolvedValueOnce({ isDirectory: () => false } as Stats) // subfolder/file2.md
        .mockResolvedValueOnce({ isDirectory: () => true } as Stats) // subfolder/subsubfolder/
        .mockResolvedValueOnce({ isDirectory: () => false } as Stats) // subfolder/subsubfolder/file.md
        .mockResolvedValueOnce({ isDirectory: () => false } as Stats) // subfolder/subsubfolder/file2.md
        .mockResolvedValueOnce({ isDirectory: () => false } as Stats); // manifest.json

      const result = await service['generateManifestEntry'](
        mockCustomTutorial.absolutePath,
      );

      expect(result).toEqual([
        {
          args: {
            path: '/intro.md',
          },
          id: 'intro.md',
          label: 'intro',
          type: 'internal-link',
        },
        {
          children: [
            {
              args: {
                path: '/subfolder/file.md',
              },
              id: 'file.md',
              label: 'file',
              type: 'internal-link',
            },
            {
              args: {
                path: '/subfolder/file2.md',
              },
              id: 'file2.md',
              label: 'file2',
              type: 'internal-link',
            },
            {
              children: [
                {
                  args: {
                    path: '/subfolder/subsubfolder/file.md',
                  },
                  id: 'file.md',
                  label: 'file',
                  type: 'internal-link',
                },
                {
                  args: {
                    path: '/subfolder/subsubfolder/file2.md',
                  },
                  id: 'file2.md',
                  label: 'file2',
                  type: 'internal-link',
                },
              ],
              id: 'subsubfolder',
              label: 'subsubfolder',
              type: 'group',
            },
          ],
          id: 'subfolder',
          label: 'subfolder',
          type: 'group',
        },
      ]);
      expect(spy).toBeCalledTimes(5); // Should call util to fix win path
    });
  });

  describe('getManifest', () => {
    it('should successfully get manifest', async () => {
      mFs.readFile.mockResolvedValueOnce(
        Buffer.from(JSON.stringify(mockCustomTutorialManifestJson)),
      );

      const result = await service.getManifestJson(
        mockCustomTutorial.absolutePath,
      );

      expect(result).toEqual(mockCustomTutorialManifestJson);
    });

    it('should return null when no manifest found', async () => {
      mFs.readFile.mockRejectedValueOnce(new Error('No file'));

      const result = await service.getManifestJson(
        mockCustomTutorial.absolutePath,
      );

      expect(result).toEqual(null);
    });
  });

  describe('generateTutorialManifest', () => {
    it('should successfully generate manifest', async () => {
      mFs.readFile.mockResolvedValueOnce(
        Buffer.from(JSON.stringify(mockCustomTutorialManifestJson)),
      );

      const result = await service.generateTutorialManifest(mockCustomTutorial);

      expect(result).toEqual(mockCustomTutorialManifest);
    });

    it('should generate manifest without children', async () => {
      mFs.readFile.mockRejectedValueOnce(new Error('No file'));

      const result = await service.generateTutorialManifest(mockCustomTutorial);

      expect(result).toEqual({
        ...mockCustomTutorialManifest,
        children: [],
      });
    });

    it('should return null in case of any error', async () => {
      const result = await service.generateTutorialManifest(null);

      expect(result).toEqual(null);
    });
  });
});
