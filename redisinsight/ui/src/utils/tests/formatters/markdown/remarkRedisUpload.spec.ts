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

const visitMock = visit as jest.Mock

const setupVisitMock = (node: Record<string, unknown>) => {
  visitMock.mockImplementation(
    (_tree, _name, callback: (n: Record<string, unknown>) => void) => {
      callback(node)
    },
  )
}

describe('remarkRedisUpload', () => {
  testCases.forEach((tc) => {
    it(`should return ${tc.resultPath} + ${tc.meta} for ${tc.lang} ${tc.meta}`, () => {
      const node = {
        type: 'code',
        lang: tc.lang,
        meta: tc.meta,
      }

      setupVisitMock(node)

      const remark = remarkRedisUpload(tc.path)
      remark({} as Node)
      expect(node).toEqual({
        ...node,
        type: 'html',
        value: getValue(tc.meta, tc.resultPath),
      })
    })
  })

  it('should escape label to prevent JSX attribute breakout', () => {
    const maliciousLabel =
      'x" path="/x" /> <img src={alert(1)} /> <RedisUploadButton label="y'
    const node = {
      type: 'code',
      lang: 'redis-upload:[/_data/file.txt]',
      meta: maliciousLabel,
    }

    setupVisitMock(node)

    const remark = remarkRedisUpload(`${TUTORIAL_PATH}/intro.md`)
    remark({} as Node)

    expect(node.type).toBe('html')
    expect(node.value).not.toContain('"/>')
    expect(node.value).not.toContain('<img')
    expect(node.value).not.toContain('{alert')
  })
})
