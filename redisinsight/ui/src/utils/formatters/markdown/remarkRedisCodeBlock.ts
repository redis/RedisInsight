import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

const REDIS_UPLOAD_RE = /^redis-upload:\[(.*)] (.*)/i
const PARAMS_SEPARATOR = ':'

// Turns Redis code fences into structured mdast nodes carrying real props via
// data.hName/hProperties, so react-markdown maps them to components without any
// HTML string or expression evaluation.
export const remarkRedisCodeBlock =
  (): ((tree: Root) => void) => (tree: any) => {
    visit(tree, 'code', (node: any) => {
      const lang: string = node.lang || ''
      const meta: string = node.meta || ''
      const value: string = node.value || ''

      const uploadMatch = `${lang} ${meta}`.match(REDIS_UPLOAD_RE)
      if (uploadMatch) {
        const [, file, label] = uploadMatch
        node.data = { hName: 'redisupload', hProperties: { file, label } }
        return
      }

      if (lang.startsWith('redis')) {
        const [, params = ''] = lang.split(PARAMS_SEPARATOR)
        node.data = {
          hName: 'rediscode',
          hProperties: { label: meta, params, lang: 'redis', value },
        }
        return
      }

      if (lang) {
        node.data = {
          hName: 'codeblock',
          hProperties: { label: meta, lang, value },
        }
      }
    })
  }
