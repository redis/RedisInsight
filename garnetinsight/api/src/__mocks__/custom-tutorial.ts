import {
  CustomTutorial,
  CustomTutorialActions,
} from 'src/modules/custom-tutorial/models/custom-tutorial';
import { CustomTutorialEntity } from 'src/modules/custom-tutorial/entities/custom-tutorial.entity';
import { CustomTutorialManifestType } from 'src/modules/custom-tutorial/models/custom-tutorial.manifest';
import { MemoryStoredFile } from 'nestjs-form-data';
import { UploadCustomTutorialDto } from 'src/modules/custom-tutorial/dto/upload.custom-tutorial.dto';
import AdmZip from 'adm-zip';

export const mockCustomTutorialId =
  'a77b23c1-7816-4ea4-b61f-d37795a0f805-ct-id';

export const mockCustomTutorialId2 =
  'a77b23c1-7816-4ea4-b61f-d37795a0f805-ct-id-2';

export const mockCustomTutorialTmpPath = '/tmp/path';

export const mockCustomTutorialsHttpLink = 'https://github.com/archive.zip';
export const mockCustomTutorialsHttpLink2 =
  'https://raw.githubusercontent.com/archive.zip';

export const mockCustomTutorial = Object.assign(new CustomTutorial(), {
  id: mockCustomTutorialId,
  name: 'custom tutorial',
  createdAt: new Date(),
});

export const mockCustomTutorialEntity = Object.assign(
  new CustomTutorialEntity(),
  {
    ...mockCustomTutorial,
  },
);

export const mockCustomTutorial2 = Object.assign(new CustomTutorial(), {
  id: mockCustomTutorialId2,
  name: 'custom tutorial 2',
  link: mockCustomTutorialsHttpLink,
  createdAt: new Date(),
});

export const mockCustomTutorialZipFile = Object.assign(new MemoryStoredFile(), {
  size: 100,
  buffer: Buffer.from('zip-content', 'utf8'),
});

export const mockCustomTutorialZipFileAxiosResponse = {
  data: mockCustomTutorialZipFile.buffer,
};

export const mockCustomTutorialAdmZipEntry = {
  entryName: 'somefolder/info.md',
} as AdmZip.IZipEntry;

export const mockCustomTutorialMacosxAdmZipEntry = {
  entryName: '__MACOSX/info.md',
} as AdmZip.IZipEntry;

export const mockUploadCustomTutorialDto = Object.assign(
  new UploadCustomTutorialDto(),
  {
    file: mockCustomTutorialZipFile,
  },
);

export const mockUploadCustomTutorialExternalLinkDto = Object.assign(
  new UploadCustomTutorialDto(),
  {
    link: mockCustomTutorialsHttpLink,
  },
);

export const mockCustomTutorialManifestJson = {
  type: CustomTutorialManifestType.Group,
  id: mockCustomTutorialId,
  label: mockCustomTutorial.name,
  children: [
    {
      type: 'group',
      id: 'ct-folder-1',
      label: 'ct-folder-1',
      children: [
        {
          type: CustomTutorialManifestType.Group,
          id: 'ct-sub-folder-1',
          label: 'ct-sub-folder-1',
          children: [
            {
              type: CustomTutorialManifestType.InternalLink,
              id: 'introduction',
              label: 'introduction',
              summary: 'Introduction summary',
              args: {
                path: '/ct-folder-1/ct-sub-folder-1/introduction.md',
              },
            },
            {
              type: CustomTutorialManifestType.InternalLink,
              id: 'working-with-hashes',
              label: 'working-with-hashes',
              args: {
                path: '/ct-folder-1/ct-sub-folder-1/working-with-hashes.md',
              },
            },
          ],
        },
        {
          type: CustomTutorialManifestType.Group,
          id: 'ct-sub-folder-2',
          label: 'ct-sub-folder-2',
          children: [
            {
              type: CustomTutorialManifestType.InternalLink,
              id: 'introduction',
              label: 'introduction',
              args: {
                path: '/ct-folder-1/ct-sub-folder-2/introduction.md',
              },
            },
            {
              type: CustomTutorialManifestType.InternalLink,
              id: 'working-with-graphs',
              label: 'working-with-graphs',
              args: {
                path: '/ct-folder-1/ct-sub-folder-2/working-with-graphs.md',
              },
            },
          ],
        },
      ],
    },
  ],
};

export const mockCustomTutorialManifest = {
  ...mockCustomTutorialManifestJson,
  type: CustomTutorialManifestType.Group,
  id: mockCustomTutorialId,
  label: mockCustomTutorial.name,
  _actions: mockCustomTutorial.actions,
  _path: mockCustomTutorial.path,
};

export const mockCustomTutorialManifest2 = {
  type: CustomTutorialManifestType.Group,
  id: mockCustomTutorialId2,
  label: mockCustomTutorial2.name,
  _actions: mockCustomTutorial2.actions,
  _path: mockCustomTutorial2.path,
  children: [mockCustomTutorialManifestJson],
};

export const globalCustomTutorialManifest = {
  type: CustomTutorialManifestType.Group,
  id: 'custom-tutorials',
  label: 'My tutorials',
  _actions: [CustomTutorialActions.CREATE],
  args: {
    withBorder: true,
    initialIsOpen: false,
  },
  children: [mockCustomTutorialManifest, mockCustomTutorialManifest2],
};

export const mockCustomTutorialFsProvider = jest.fn(() => ({
  unzipFromMemoryStoredFile: jest
    .fn()
    .mockResolvedValue(mockCustomTutorialTmpPath),
  unzipFromExternalLink: jest.fn().mockResolvedValue(mockCustomTutorialTmpPath),
  unzipToTmpFolder: jest.fn().mockResolvedValue(mockCustomTutorialTmpPath),
  moveFolder: jest.fn(),
  removeFolder: jest.fn(),
}));

export const mockCustomTutorialManifestProvider = jest.fn(() => ({
  getOriginalManifestJson: jest
    .fn()
    .mockResolvedValue(mockCustomTutorialManifestJson),
  getManifestJson: jest.fn().mockResolvedValue(mockCustomTutorialManifestJson),
  generateTutorialManifest: jest
    .fn()
    .mockResolvedValue(mockCustomTutorialManifest),
  isOriginalManifestExists: jest.fn().mockResolvedValue(true),
}));

export const mockCustomTutorialRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockCustomTutorial),
  create: jest.fn().mockResolvedValue(mockCustomTutorial),
  delete: jest.fn(),
  list: jest.fn().mockResolvedValue([mockCustomTutorial, mockCustomTutorial2]),
}));

export const mockCustomTutorialAnalytics = jest.fn(() => ({
  sendImportSucceeded: jest.fn(),
  sendImportFailed: jest.fn(),
}));
