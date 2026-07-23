import { visit } from 'unist-util-visit'
import DOMPurify from 'dompurify'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { wrapJsxBraces } from './wrapJsxBraces'

const isOpeningTag = (value: string) =>
  value.startsWith('<') && !value.startsWith('</') && value.endsWith('>')
const removeClosingTag = (value: string) =>
  value.replace(/<\/[a-zA-Z][^>]*>/g, '')
const isContainsClosingTag = (value: string) => value.indexOf('</') > -1

DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    if (!IS_ABSOLUTE_PATH.test(node.getAttribute('href') || '')) {
      node.removeAttribute('href')
      return
    }

    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export const remarkSanitize = (): ((tree: Node) => void) => (tree: any) => {
  visit(tree, 'html', (node) => {
    const inputTag = node.value.toLowerCase()

    // JUST BANNED
    if (inputTag.indexOf('dangerouslysetinnerhtml') > -1) {
      node.value = ''
    }

    if (isOpeningTag(inputTag)) {
      const isTagContainsClosing = isContainsClosingTag(inputTag)
      const sanitized = DOMPurify.sanitize(node.value)
      node.value = isTagContainsClosing
        ? sanitized
        : removeClosingTag(sanitized)
    }

    // Neutralize JSX braces so JsxParser renders them literally. DOMPurify keeps
    // `{expression}` as harmless text, but JsxParser evaluates it as JavaScript.
    // This runs before the custom-component plugins emit their own JSX, whose
    // intentional {expr} props must stay evaluable.
    node.value = wrapJsxBraces(node.value)
  })
}
