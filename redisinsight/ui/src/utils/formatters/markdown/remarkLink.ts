/* eslint-disable max-len */
import { visit } from 'unist-util-visit'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

export const remarkLink = (): ((tree: Node) => void) => (tree: any) => {
  // Find link node in syntax tree
  visit(tree, 'link', (node) => {
    if (IS_ABSOLUTE_PATH.test(node.url)) {
      // External link
      const [text] = node.children || []
      node.type = 'html'
      node.value = `<Link external target="_blank" href="${node.url}" rel="nofollow noopener noreferrer" variant="inline" size="S">${text?.value || EXTERNAL_LINKS.redisIo}</Link>`
    }

    if (node.title === 'Redis Cloud') {
      const [text] = node.children || []
      node.type = 'html'
      node.value = `<CloudLink url="${node.url}" text="${text?.value || 'Redis Cloud'}" />`
    }

    if (node.url?.toLowerCase()?.startsWith('redisinsight')) {
      const [text] = node.children || []
      const url = node.url.replace('redisinsight:', '')
      node.type = 'html'
      node.value = `<RedisInsightLink url="${url}" text="${text?.value || 'Redis Cloud'}" size="S" />`
    }
  })
}
