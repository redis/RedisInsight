import React, { useMemo } from 'react'
import { unified } from 'unified'
import type { Plugin } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import DOMPurify from 'dompurify'

import { remarkSanitize } from 'uiSrc/utils/formatters/markdown'
import { Nullable } from 'uiSrc/utils'

import { MarkdownViewerProps } from './MarkdownViewer.types'
import * as S from './MarkdownViewer.styles'

// Untrusted values get no elements that load remote resources (img/media leak
// the viewer's IP and enable tracking), embed/script content, or take input.
// DOMPurify drops on* handlers by default; style is the attribute it keeps.
const FORBIDDEN_TAGS = [
  'img',
  'video',
  'audio',
  'source',
  'svg',
  'math',
  'iframe',
  'object',
  'embed',
  'link',
  'style',
  'meta',
  'base',
  'form',
  'input',
  'textarea',
  'select',
  'button',
]
const SANITIZE_CONFIG = { FORBID_TAGS: FORBIDDEN_TAGS, FORBID_ATTR: ['style'] }

// The custom plugin types its tree as DOM nodes, so it is cast to unist Plugin.
const markdownToSafeHtml = (value: string): string => {
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkSanitize as unknown as Plugin)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(value),
  )

  // Absolute-only links, target=_blank and rel=noopener come from the global
  // DOMPurify hooks remarkSanitize registers at import; it must stay imported.
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}

export const MarkdownViewer = ({
  value,
  'data-testid': dataTestId = 'markdown-viewer',
}: MarkdownViewerProps) => {
  const html: Nullable<string> = useMemo(() => {
    try {
      return markdownToSafeHtml(value)
    } catch {
      return null
    }
  }, [value])

  if (html === null) {
    return <S.Container data-testid={dataTestId}>{value}</S.Container>
  }

  // The value is untrusted, so it is rendered as DOMPurify-sanitized HTML rather
  // than parsed as JSX: a JSX parser would evaluate `{...}` expressions embedded
  // in raw HTML, which sanitization does not neutralize.
  return (
    <S.Container
      data-testid={dataTestId}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
