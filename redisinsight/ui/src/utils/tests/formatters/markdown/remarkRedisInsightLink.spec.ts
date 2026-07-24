import type { Root } from 'mdast'
import { remarkRedisInsightLink } from 'uiSrc/utils/formatters/markdown/remarkRedisInsightLink'

const runOn = (link: { url?: string; text?: string }) => {
  const node: any = {
    type: 'link',
    url: link.url,
    children: link.text ? [{ type: 'text', value: link.text }] : [],
  }
  const tree: Root = { type: 'root', children: [node] }
  remarkRedisInsightLink()(tree)
  return node
}

describe('remarkRedisInsightLink', () => {
  it('maps a redisinsight: link to redisinsightlink, stripping the scheme', () => {
    const node = runOn({ url: 'redisinsight:/browser', text: 'Open' })
    expect(node.data.hName).toBe('redisinsightlink')
    expect(node.data.hProperties).toEqual({ url: '/browser', text: 'Open' })
  })

  it('matches the scheme case-insensitively', () => {
    const node = runOn({ url: 'RedisInsight:/browser', text: 'Open' })
    expect(node.data.hName).toBe('redisinsightlink')
    expect(node.data.hProperties.url).toBe('/browser')
  })

  it('defaults text to an empty string when the link has no children', () => {
    const node = runOn({ url: 'redisinsight:/browser' })
    expect(node.data.hProperties.text).toBe('')
  })

  it('leaves non-redisinsight links unchanged', () => {
    const node = runOn({ url: 'https://redis.io', text: 'Redis' })
    expect(node.data).toBeUndefined()
  })
})
