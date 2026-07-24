import type { Root } from 'mdast'
import { remarkRedisCodeBlock } from 'uiSrc/utils/formatters/markdown/remarkRedisCodeBlock'

const runOn = (code: {
  lang?: string | null
  meta?: string | null
  value?: string
}) => {
  const node: any = { type: 'code', ...code }
  const tree: Root = { type: 'root', children: [node] }
  remarkRedisCodeBlock()(tree)
  return node
}

describe('remarkRedisCodeBlock', () => {
  it('maps a redis fence to rediscode with value and params', () => {
    const node = runOn({
      lang: 'redis:cluster',
      meta: 'Run me',
      value: 'GET k',
    })
    expect(node.data.hName).toBe('rediscode')
    expect(node.data.hProperties).toEqual({
      label: 'Run me',
      params: 'cluster',
      lang: 'redis',
      value: 'GET k',
    })
  })

  it('maps a redis-upload fence to redisupload', () => {
    const node = runOn({
      lang: 'redis-upload:[data/x.txt]',
      meta: 'Upload',
      value: '',
    })
    expect(node.data.hName).toBe('redisupload')
    expect(node.data.hProperties).toEqual({
      file: 'data/x.txt',
      label: 'Upload',
    })
  })

  it('maps a plain lang fence to codeblock', () => {
    const node = runOn({ lang: 'bash', meta: '', value: 'ls' })
    expect(node.data.hName).toBe('codeblock')
    expect(node.data.hProperties).toEqual({
      label: '',
      lang: 'bash',
      value: 'ls',
    })
  })

  it('leaves a no-lang fence unchanged', () => {
    const node = runOn({ lang: null, meta: '', value: 'plain' })
    expect(node.data).toBeUndefined()
  })
})
