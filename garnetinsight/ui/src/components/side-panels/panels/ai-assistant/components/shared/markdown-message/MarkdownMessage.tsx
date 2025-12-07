import React, { useCallback, useEffect, useState } from 'react'
import JsxParser from 'react-jsx-parser'
import MarkdownToJsxString from 'uiSrc/services/formatter/MarkdownToJsxString'
import { CloudLink } from 'uiSrc/components/markdown'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { ChatExternalLink, CodeBlock } from './components'

export interface CodeProps {
  children: string
  lang: string
}

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
    ExternalLink: ChatExternalLink,
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
      blacklistedTags={['iframe', 'script']}
      autoCloseVoidElements
      jsx={content}
      onError={() => setParseAsIs(true)}
    />
  )
}

export default React.memo(MarkdownMessage)
