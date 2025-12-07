import { visit } from 'unist-util-visit'
import { remarkRedisUpload } from 'uiSrc/utils/formatters/markdown'

jest.mock('unist-util-visit')

const getValue = (label: string, path: string) =>
  `<RedisUploadButton label="${label}" path="${path}" />`

const TUTORIAL_PATH = 'static/custom-tutorials/tutorial-id'

const testCases = [
  {
    lang: 'redis-upload:[../../../_data/strings.txt]',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    meta: 'Upload data',
    resultPath: `/${TUTORIAL_PATH}/_data/strings.txt`,
  },
  {
    lang: 'redis-upload:[/_data/s t rings.txt]',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    meta: 'Upload data',
    resultPath: `/${TUTORIAL_PATH}/_data/s t rings.txt`,
  },
  {
    lang: 'redis-upload:[https://somesite.test/image.png]',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    meta: 'Upload data',
    resultPath: '/image.png',
  },
]

describe('remarkRedisUpload', () => {
  testCases.forEach((tc) => {
    it(`should return ${tc.resultPath} + ${tc.meta} for ${tc.lang} ${tc.meta}`, () => {
      const node = {
        type: 'code',
        lang: tc.lang,
        meta: tc.meta,
      }

      // mock implementation
      ;(visit as jest.Mock).mockImplementation(
        (_tree: any, _name: string, callback: (node: any) => void) => {
          callback(node)
        },
      )

      const remark = remarkRedisUpload(tc.path)
      remark({} as Node)
      expect(node).toEqual({
        ...node,
        type: 'html',
        value: getValue(tc.meta, tc.resultPath),
      })
    })
  })
})
