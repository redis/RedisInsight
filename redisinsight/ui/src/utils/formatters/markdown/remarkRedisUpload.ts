import { visit } from 'unist-util-visit'
import { getFileUrlFromMd } from 'uiSrc/utils/pathUtil'
import { escapeJsxAttribute } from './escapeJsxAttribute'

export const remarkRedisUpload =
  (path: string): ((tree: Node) => void) =>
  (tree: any) => {
    visit(tree, 'code', (node) => {
      try {
        const { lang, meta } = node

        const value: string = `${lang} ${meta}`
        const [, filePath, label] =
          value.match(/^redis-upload:\[(.*)] (.*)/i) || []

        const { pathname } = new URL(getFileUrlFromMd(filePath, path))
        const decodedPath = decodeURI(pathname)

        if (path && label) {
          node.type = 'html'
          const safeLabel = escapeJsxAttribute(label)
          const safePath = escapeJsxAttribute(decodedPath)
          node.value = `<RedisUploadButton label="${safeLabel}" path="${safePath}" />`
        }
      } catch (e) {
        // ignore errors
      }
    })
  }
