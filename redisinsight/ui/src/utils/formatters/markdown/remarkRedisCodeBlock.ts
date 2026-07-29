import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

const REDIS_UPLOAD_RE = /^redis-upload:\[(.*)] (.*)/i
const PARAMS_SEPARATOR = ':'

export interface RemarkRedisCodeBlockOptions {
  // Converts every non-Redis fence (languaged or not) into a `codeblock`
  // node, so consumers that render `codeblock` via an interactive leaf (e.g.
  // Copilot chat's copy/run code block) get that behavior for all fences.
  // Tutorials omit this option so non-Redis fences (e.g. bash/json) are left
  // untouched and render as plain `<pre><code>`, with no Run button.
  allLangs?: boolean
}

// Turns Redis code fences into structured mdast nodes carrying real props via
// data.hName/hProperties, so react-markdown maps them to components without any
// HTML string or expression evaluation.
export const remarkRedisCodeBlock =
  (options?: RemarkRedisCodeBlockOptions): ((tree: Root) => void) =>
  (tree: any) => {
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

      if (options?.allLangs) {
        node.data = {
          hName: 'codeblock',
          hProperties: { label: meta, lang: lang || '', value },
        }
      }
    })
  }
