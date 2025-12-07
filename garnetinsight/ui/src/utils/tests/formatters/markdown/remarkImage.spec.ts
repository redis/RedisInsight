import { visit } from 'unist-util-visit'
import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'
import { remarkImage } from 'uiSrc/utils/formatters/markdown'

jest.mock('unist-util-visit')
const TUTORIAL_PATH = 'static/custom-tutorials/tutorial-id'
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
    url: 'https://somesite.test/image.png',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    result: 'https://somesite.test/image.png',
  },
]
describe('remarkImage', () => {
  testCases.forEach((tc) => {
    it(`should return ${tc.result} for url:${tc.url}, path: ${tc.path} `, () => {
      const node = {
        url: tc.url,
      }

      // mock implementation
      ;(visit as jest.Mock).mockImplementation(
        (_tree: any, _name: string, callback: (node: any) => void) => {
          callback(node)
        },
      )

      const remark = remarkImage(tc.path)
      remark({} as Node)
      expect(node).toEqual({
        ...node,
        url: tc.result,
      })
    })
  })
})
