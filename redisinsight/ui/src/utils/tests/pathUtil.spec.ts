import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'
import { getFileUrlFromMd, getStaticAssetPath } from '../pathUtil'

jest.mock('unist-util-visit')
const TUTORIAL_PATH = 'static/custom-tutorials/tutorial-id'
const GUIDES_PATH = 'static/guides'
const testCases = [
  {
    url: '../../../_images/relative.png',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    result: `${RESOURCES_BASE_URL}${TUTORIAL_PATH}/_images/relative.png`,
  },
  {
    url: '/_images/relative.png',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    result: `${RESOURCES_BASE_URL}${TUTORIAL_PATH}/_images/relative.png`,
  },
  {
    url: '/_images/relative.png',
    path: `${GUIDES_PATH}/lvl1/lvl2/lvl3/intro.md`,
    result: `${RESOURCES_BASE_URL}${GUIDES_PATH}/_images/relative.png`,
  },
  {
    url: '/_images/relative.png',
    path: '/unknown-path/lvl1/lvl2/lvl3/intro.md',
    result: `${RESOURCES_BASE_URL}unknown-path/lvl1/lvl2/lvl3/intro.md/_images/relative.png`,
  },
  {
    url: 'https://somesite.test/image.png',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    result: 'https://somesite.test/image.png',
  },
]
describe('getFileUrlFromMd', () => {
  testCases.forEach((tc) => {
    it(`should return ${tc.result} for url:${tc.url}, path: ${tc.path} `, () => {
      const url = getFileUrlFromMd(tc.url, tc.path)
      expect(url).toEqual(tc.result)
    })
  })
})

describe('getStaticAssetPath', () => {
  const originalWindow = global.window

  afterEach(() => {
    global.window = originalWindow
  })

  it('should return relative path for Electron environment', () => {
    global.window = {
      ...originalWindow,
      app: { config: { apiPort: '5540' } },
    } as any

    expect(getStaticAssetPath('/preset-data/bikes.txt')).toBe(
      './preset-data/bikes.txt',
    )
    expect(getStaticAssetPath('preset-data/bikes.txt')).toBe(
      './preset-data/bikes.txt',
    )
  })

  it('should return absolute path for web environment', () => {
    global.window = {
      ...originalWindow,
    } as any
    delete (global.window as any).app

    expect(getStaticAssetPath('/preset-data/bikes.txt')).toBe(
      '/preset-data/bikes.txt',
    )
    expect(getStaticAssetPath('preset-data/bikes.txt')).toBe(
      '/preset-data/bikes.txt',
    )
  })
})
