import React from 'react'
import { useDispatch } from 'react-redux'
import { CodeButtonParams } from 'uiSrc/constants'
import { sendWbQueryAction } from 'uiSrc/slices/workbench/wb-results'
import { CodeButtonBlock } from 'uiSrc/components/markdown'
import { ButtonLang } from 'uiSrc/utils/formatters/markdown/remarkCode'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

export interface Props {
  modules?: AdditionalRedisModule[]
  children: string
  lang?: string
  onRunCommand?: (query: string) => void
}

const CodeBlock = (props: Props) => {
  const { children, lang, modules, onRunCommand } = props

  const dispatch = useDispatch()

  const handleApply = (params?: CodeButtonParams, onFinish?: () => void) => {
    onRunCommand?.(children)
    dispatch(
      sendWbQueryAction(
        children,
        null,
        params,
        { afterAll: onFinish },
        onFinish,
      ),
    )
  }

  return (
    <CodeButtonBlock
      label=""
      content={children}
      isShowConfirmation
      onApply={handleApply}
      lang={lang}
      params={{ executable: lang === ButtonLang.Redis ? 'true' : 'false' }}
      modules={modules}
    />
  )
}

export default React.memo(CodeBlock)
