import { visit } from 'unist-util-visit'
import { getFileUrlFromMd } from 'uiSrc/utils/pathUtil'

export const remarkRedisUpload =
  (path: string): ((tree: Node) => void) =>
  (tree: any) => {
    // Find code node in syntax tree
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
          // Replace it with our custom component
          node.value = `<RedisUploadButton label="${label}" path="${decodedPath}" />`
        }
      } catch (e) {
        // ignore errors
      }
    })
  }
