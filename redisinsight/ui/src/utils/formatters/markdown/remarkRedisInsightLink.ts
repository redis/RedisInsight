import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

const REDISINSIGHT_SCHEME_RE = /^redisinsight:/i

// Turns redisinsight: links into a structured mdast node carrying the target
// url and text via data.hName/hProperties, so react-markdown maps them to a
// component instead of relying on the href, which safeUrl's allowlist would
// otherwise strip before any component ever sees it.
export const remarkRedisInsightLink =
  (): ((tree: Root) => void) => (tree: any) => {
    visit(tree, 'link', (node: any) => {
      const url: string = node.url || ''
      if (!REDISINSIGHT_SCHEME_RE.test(url)) return

      const [firstChild] = node.children || []
      node.data = {
        hName: 'redisinsightlink',
        hProperties: {
          url: url.replace(REDISINSIGHT_SCHEME_RE, ''),
          text: firstChild?.value || '',
        },
      }
    })
  }
