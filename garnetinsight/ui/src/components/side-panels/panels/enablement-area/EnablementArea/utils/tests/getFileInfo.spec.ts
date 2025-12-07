import { ApiEndpoints, MOCK_TUTORIALS_ITEMS } from 'uiSrc/constants'
import {
  getFileInfo,
  getGroupPath,
  getMarkdownPathByManifest,
  getPagesInsideGroup,
  getParentByManifest,
  getTutorialSection,
  getWBSourcePath,
  removeManifestPrefix,
} from '../getFileInfo'

const getFileInfoTests = [
  {
    input: [{ path: 'static/workbench/quick-guides/file-name.txt' }],
    expected: {
      name: 'file-name',
      parent: 'quick guides',
      extension: 'txt',
      location: '/static/workbench/quick-guides',
      label: 'file-name',
      _key: null,
      parents: [],
    },
  },
  {
    input: [{ path: 'parent_folder\\file_name.txt' }],
    expected: {
      name: 'file_name',
      parent: 'parent folder',
      extension: 'txt',
      location: '/parent_folder',
      label: 'file_name',
      _key: null,
      parents: [],
    },
  },
  {
    input: [
      { path: 'https://domen.com/workbench/enablement-area/introduction.html' },
    ],
    expected: {
      name: 'introduction',
      parent: 'enablement area',
      extension: 'html',
      location: '/workbench/enablement-area',
      label: 'introduction',
      _key: null,
      parents: [],
    },
  },
  {
    input: [{ path: 'https://domen.com/introduction.html' }],
    expected: {
      name: 'introduction',
      parent: '',
      extension: 'html',
      location: '',
      label: 'introduction',
      _key: null,
      parents: [],
    },
  },
  {
    input: [{ path: '/introduction.html' }],
    expected: {
      name: 'introduction',
      parent: '',
      extension: 'html',
      location: '',
      label: 'introduction',
      _key: null,
      parents: [],
    },
  },
  {
    input: [{ path: '//parent/markdown.md' }],
    expected: {
      name: '',
      parent: '',
      extension: '',
      location: '',
      label: '',
      parents: [],
    },
  },
  {
    input: [{ path: '/file.txt' }],
    expected: {
      name: 'file',
      parent: '',
      extension: 'txt',
      location: '',
      label: 'file',
      _key: null,
      parents: [],
    },
  },
  {
    input: [{ path: '' }],
    expected: {
      name: '',
      parent: '',
      extension: '',
      location: '',
      label: '',
      _key: null,
      parents: [],
    },
  },
  {
    input: [{ path: '/' }],
    expected: {
      name: '',
      parent: '',
      extension: '',
      location: '',
      label: '',
      _key: null,
      parents: [],
    },
  },
  {
    input: [
      {
        manifestPath: 'quick-guides/0/0',
        path: '/static/workbench/quick-guides/document/learn-more.md',
      },
      MOCK_TUTORIALS_ITEMS,
    ],
    expected: {
      name: 'learn-more',
      parent: MOCK_TUTORIALS_ITEMS[0].label,
      extension: 'md',
      location: '/static/workbench/quick-guides/document',
      label: MOCK_TUTORIALS_ITEMS?.[0]?.children?.[0].label,
      _key: '0',
      parents: [MOCK_TUTORIALS_ITEMS[0]],
    },
  },
]

describe('getFileInfo', () => {
  test.each(getFileInfoTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = getFileInfo(...input)
    expect(result).toEqual(expected)
  })
})

const getPagesInsideGroupTests = [
  {
    input: [MOCK_TUTORIALS_ITEMS, 'quick-guides/0/0'],
    expected: (MOCK_TUTORIALS_ITEMS[0].children || []).map((item, index) => ({
      ...item,
      _groupPath: 'quick-guides/0',
      _key: `${index}`,
    })),
  },
  {
    input: [
      MOCK_TUTORIALS_ITEMS,
      'https://domen.com/workbench/enablement-area/',
    ],
    expected: [],
  },
  {
    input: [],
    expected: [],
  },
]

describe('getPagesInsideGroup', () => {
  test.each(getPagesInsideGroupTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = getPagesInsideGroup(...input)
    expect(result).toEqual(expected)
  })
})

const getTutorialSectionTests = [
  { input: 'custom-tutorials/0/1', expected: 'Custom Tutorials' },
  { input: '/custom-tutorials/0/1', expected: 'Custom Tutorials' },
  { input: 'quick-guides/0/1', expected: 'Guides' },
  { input: 'tutorials/0/1', expected: 'Tutorials' },
  { input: 'my-tutorials/0/1', expected: undefined },
]

describe('getTutorialSection', () => {
  test.each(getTutorialSectionTests)('%j', ({ input, expected }) => {
    const result = getTutorialSection(input)
    expect(result).toEqual(expected)
  })
})

const getWBSourcePathTests = [
  {
    input: '/static/tutorials/folder/md.md',
    expected: ApiEndpoints.TUTORIALS_PATH,
  },
  { input: '/static/guides/folder/md.md', expected: ApiEndpoints.GUIDES_PATH },
  {
    input: '/static/custom-tutorials/folder/md.md',
    expected: ApiEndpoints.CUSTOM_TUTORIALS_PATH,
  },
  { input: '/static/my-tutorials/folder/md.md', expected: '' },
]

describe('getWBSourcePath', () => {
  test.each(getWBSourcePathTests)('%j', ({ input, expected }) => {
    const result = getWBSourcePath(input)
    expect(result).toEqual(expected)
  })
})

const getMarkdownPathByManifestTests = [
  {
    input: [MOCK_TUTORIALS_ITEMS, '/quick-guides/0/0', 'static/my-folder'],
    expected: `static/my-folder${MOCK_TUTORIALS_ITEMS[0]?.children?.[0]?.args?.path}`,
  },
  {
    input: [MOCK_TUTORIALS_ITEMS, '/quick-guides/0/0'],
    expected: MOCK_TUTORIALS_ITEMS[0]?.children?.[0]?.args?.path,
  },
  {
    input: [MOCK_TUTORIALS_ITEMS, '/my-guides/0/0', 'path/'],
    expected: '',
  },
  {
    input: [MOCK_TUTORIALS_ITEMS, '/quick-guides/0/1'],
    expected: `/${MOCK_TUTORIALS_ITEMS[0]?.children?.[1]?.args?.path}`,
  },
  {
    input: [MOCK_TUTORIALS_ITEMS, '/quick-guides/0/2'],
    expected: '/quick-guides/working-with-hash.html',
  },
]

describe('getMarkdownPathByManifest', () => {
  test.each(getMarkdownPathByManifestTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = getMarkdownPathByManifest(...input)
    expect(result).toEqual(expected)
  })
})

const removeManifestPrefixTests = [
  { input: '/quick-guides/0/0/1', expected: '0/0/1' },
  { input: '/tutorials/0/0/1', expected: '0/0/1' },
  { input: '/custom-tutorials/0/0/1', expected: '0/0/1' },
  { input: '/my-tutorials/0/0/1', expected: 'my-tutorials/0/0/1' },
]

describe('removeManifestPrefix', () => {
  test.each(removeManifestPrefixTests)('%j', ({ input, expected }) => {
    const result = removeManifestPrefix(input)
    expect(result).toEqual(expected)
  })
})

const getGroupPathTests = [
  { input: '/quick-guides/0/0/1', expected: 'quick-guides/0/0' },
  {
    input: '/tutorials/another-folder/0/0/1',
    expected: 'tutorials/another-folder/0/0',
  },
]

describe('getGroupPath', () => {
  test.each(getGroupPathTests)('%j', ({ input, expected }) => {
    const result = getGroupPath(input)
    expect(result).toEqual(expected)
  })
})

const getParentByManifestTests = [
  { input: [MOCK_TUTORIALS_ITEMS, '0/0'], expected: MOCK_TUTORIALS_ITEMS[0] },
  { input: [MOCK_TUTORIALS_ITEMS, '100/0'], expected: null },
  { input: [MOCK_TUTORIALS_ITEMS, null], expected: null },
]

describe('getParentByManifest', () => {
  test.each(getParentByManifestTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = getParentByManifest(...input)
    expect(result).toEqual(expected)
  })
})
