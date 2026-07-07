import React, { useMemo } from 'react'
import JsxParser from 'react-jsx-parser'
import { unified } from 'unified'
import type { Plugin } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import DOMPurify from 'dompurify'

import {
  rehypeWrapSymbols,
  remarkSanitize,
} from 'uiSrc/utils/formatters/markdown'
import { Nullable } from 'uiSrc/utils'

import { MarkdownViewerProps } from './MarkdownViewer.types'
import * as S from './MarkdownViewer.styles'

// Tags that can execute code, load external resources, submit data, or hijack
// layout; none are legitimate output of value markdown.
const BLACKLISTED_TAGS = [
  'script',
  'iframe',
  'link',
  'object',
  'embed',
  'form',
  'input',
  'textarea',
  'select',
  'button',
  'meta',
  'base',
  'style',
  'svg',
  'math',
  'video',
  'audio',
  'source',
  'applet',
  'frame',
  'frameset',
]

const BLACKLISTED_ATTRS = [/^on.*/i, /^style$/i]

// Symbols wrapped as {"$&"} string expressions so JsxParser renders them
// literally. Only "{" and "}" are wrapped: DOMPurify leaves them untouched but
// re-encodes ">" to "&gt;", which JsxParser decodes back to ">". Wrapping ">"
// too would make DOMPurify turn {">"} into {"&gt;"}, which JsxParser renders
// verbatim instead of as ">".
const JSX_WRAP_SYMBOLS = ['{', '}']

// remarkSanitize and rehypeWrapSymbols type their trees as DOM nodes while
// unified expects unist plugins, so they are cast at the use site.
const markdownToHtml = (value: string): string => {
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkSanitize as unknown as Plugin)
      .use(remarkGfm) // support GitHub Flavored Markdown
      .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
      .use(rehypeWrapSymbols as unknown as Plugin<[string[]]>, JSX_WRAP_SYMBOLS) // Wrap curly braces for JSX parse
      .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings
      .processSync(value),
  )

  // Sanitize the final serialized string so markdown-native links (which
  // remarkSanitize never inspects) and any raw HTML the mdast heuristics miss
  // are neutralized before JsxParser. Href hardening (absolute-only links,
  // target="_blank" and rel="noopener noreferrer") comes from the global
  // DOMPurify hooks that remarkSanitize registers at module load, so
  // remarkSanitize must stay in the pipeline imports for this call to apply it.
  return DOMPurify.sanitize(html)
}

export const MarkdownViewer = ({
  value,
  'data-testid': dataTestId = 'markdown-viewer',
}: MarkdownViewerProps) => {
  const html: Nullable<string> = useMemo(() => {
    try {
      return markdownToHtml(value)
    } catch {
      return null
    }
  }, [value])

  return (
    <S.Container data-testid={dataTestId}>
      {html === null ? (
        value
      ) : (
        <JsxParser
          components={{}}
          blacklistedTags={BLACKLISTED_TAGS}
          blacklistedAttrs={BLACKLISTED_ATTRS}
          autoCloseVoidElements
          jsx={html}
        />
      )}
    </S.Container>
  )
}
