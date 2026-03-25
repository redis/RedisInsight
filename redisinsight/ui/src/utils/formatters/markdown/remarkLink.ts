/* eslint-disable max-len */
import { visit } from 'unist-util-visit'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { escapeJsxAttribute } from './escapeJsxAttribute'

export const remarkLink = (): ((tree: Node) => void) => (tree: any) => {
  visit(tree, 'link', (node) => {
    if (IS_ABSOLUTE_PATH.test(node.url)) {
      const [text] = node.children || []
      const safeUrl = escapeJsxAttribute(node.url)
      const safeText = escapeJsxAttribute(text?.value || EXTERNAL_LINKS.redisIo)
      node.type = 'html'
      node.value = `<Link external target="_blank" href="${safeUrl}" rel="nofollow noopener noreferrer" variant="inline" size="S">${safeText}</Link>`
    }

    if (node.title === 'Redis Cloud') {
      const [text] = node.children || []
      const safeUrl = escapeJsxAttribute(node.url)
      const safeText = escapeJsxAttribute(text?.value || 'Redis Cloud')
      node.type = 'html'
      node.value = `<CloudLink url="${safeUrl}" text="${safeText}" />`
    }

    if (node.url?.toLowerCase()?.startsWith('redisinsight')) {
      const [text] = node.children || []
      const url = node.url.replace('redisinsight:', '')
      const safeUrl = escapeJsxAttribute(url)
      const safeText = escapeJsxAttribute(text?.value || 'Redis Cloud')
      node.type = 'html'
      node.value = `<RedisInsightLink url="${safeUrl}" text="${safeText}" size="S" />`
    }
  })
}
