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

// ">" stays unwrapped: DOMPurify re-encodes it to "&gt;" and JsxParser decodes
// it back, while a wrapped {">"} would render as the "&gt;" entity text.
const JSX_WRAP_SYMBOLS = ['{', '}']

// The custom plugins type their trees as DOM nodes, so they are cast to unist Plugin.
const markdownToHtml = (value: string): string => {
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkSanitize as unknown as Plugin)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeWrapSymbols as unknown as Plugin<[string[]]>, JSX_WRAP_SYMBOLS)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(value),
  )

  // Final-string sanitize covers what remarkSanitize never inspects (markdown-native
  // links, raw HTML its mdast heuristics miss). Href hardening comes from the global
  // DOMPurify hooks remarkSanitize registers at module load - it must stay imported.
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
