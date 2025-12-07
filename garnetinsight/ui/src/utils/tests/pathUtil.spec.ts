import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'
import { getFileUrlFromMd } from '../pathUtil'

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
