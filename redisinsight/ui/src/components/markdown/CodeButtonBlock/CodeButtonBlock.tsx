import React, { useEffect, useState } from 'react'
import { monaco } from 'react-monaco-editor'
import parse from 'html-react-parser'
import { useParams } from 'react-router-dom'
import { find } from 'lodash'
import {
  getCommandsForExecution,
  getUnsupportedModulesFromQuery,
  truncateText,
  handleCopy as handleCopyUtil,
} from 'uiSrc/utils'
import {
  BooleanParams,
  CodeButtonParams,
  MonacoLanguage,
} from 'uiSrc/constants'

import { CodeBlock } from 'uiSrc/components'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { getDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import {
  ModuleNotLoadedMinimalized,
  DatabaseNotOpened,
} from 'uiSrc/components/messages'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { ButtonLang } from 'uiSrc/utils/formatters/markdown/remarkCode'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import {
  PlayIcon,
  CheckBoldIcon,
  CopyIcon,
  ToastCheckIcon,
} from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import { RunConfirmationPopover } from './components'
import * as S from './CodeButtonBlock.styles'

export interface Props {
  content: string
  onApply?: (params?: CodeButtonParams, onFinish?: () => void) => void
  modules?: AdditionalRedisModule[]
  onCopy?: () => void
  label?: string
  isLoading?: boolean
  className?: string
  params?: CodeButtonParams
  isShowConfirmation?: boolean
  lang?: string
}

const FINISHED_COMMAND_INDICATOR_TIME_MS = 5_000

const CodeButtonBlock = (props: Props) => {
  const {
    lang,
    onApply,
    label,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    className: _className,
    params,
    content,
    onCopy,
    modules = [],
    isShowConfirmation = true,
    ...rest
  } = props

  const [highlightedContent, setHighlightedContent] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRan, setIsRan] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()

  const isButtonHasConfirmation =
    params?.run_confirmation === BooleanParams.true
  const isRunButtonHidden = params?.executable === BooleanParams.false
  const [notLoadedModule] = isRunButtonHidden
    ? []
    : getUnsupportedModulesFromQuery(modules, content)

  useEffect(() => {
    if (!lang) return

    const languageId =
      lang === ButtonLang.Redis
        ? MonacoLanguage.Redis
        : find(monaco.languages?.getLanguages(), ({ id }) => id === lang)?.id

    if (languageId) {
      monaco.editor.colorize(content.trim(), languageId, {}).then((data) => {
        setHighlightedContent(data)
      })
    }
  }, [])

  const getIsShowConfirmation = () =>
    isShowConfirmation &&
    !getDBConfigStorageField(
      instanceId,
      ConfigDBStorageItem.notShowConfirmationRunTutorial,
    )

  const handleCopy = () => {
    const query = getCommandsForExecution(content)?.join('\n') || ''
    handleCopyUtil(query)
    setIsCopied(true)
    onCopy?.()
  }

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false)
      }, 1000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [isCopied])

  const runQuery = () => {
    setIsLoading(true)
    onApply?.(params, () => {
      setIsLoading(false)
      setIsRan(true)
      setTimeout(() => setIsRan(false), FINISHED_COMMAND_INDICATOR_TIME_MS)
    })
  }

  const handleRunClicked = () => {
    if (
      !instanceId ||
      notLoadedModule ||
      (getIsShowConfirmation() && isButtonHasConfirmation)
    ) {
      setIsPopoverOpen((v) => !v)
      return
    }

    runQuery()
  }

  const handleApplyRun = () => {
    handleClosePopover()
    runQuery()
  }

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const getPopoverMessage = (): React.ReactNode => {
    if (!instanceId) {
      return <DatabaseNotOpened />
    }

    if (notLoadedModule) {
      return (
        <ModuleNotLoadedMinimalized
          moduleName={notLoadedModule}
          source={OAuthSocialSource.Tutorials}
          onClose={() => setIsPopoverOpen(false)}
        />
      )
    }

    return <RunConfirmationPopover onApply={handleApplyRun} />
  }

  return (
    <S.Wrapper>
      <Row align="center">
        <FlexItem grow>
          {!!label && (
            <Title size="XS" data-testid="code-button-block-label">
              {truncateText(label, 86)}
            </Title>
          )}
        </FlexItem>
        <S.Actions>
          <S.CopyBtn>
            <S.ActionBtn>
              <EmptyButton
                onClick={handleCopy}
                icon={isCopied ? ToastCheckIcon : CopyIcon}
                disabled={isCopied}
                size="small"
                data-testid={`copy-btn-${label}`}
              >
                Copy
              </EmptyButton>
            </S.ActionBtn>
          </S.CopyBtn>
          {!isRunButtonHidden && (
            <RiPopover
              ownFocus
              panelClassName="popoverLikeTooltip"
              minWidth={S.POPOVER_MIN_WIDTH}
              anchorPosition="upLeft"
              isOpen={isPopoverOpen}
              panelPaddingSize="m"
              closePopover={handleClosePopover}
              button={
                <S.PopoverAnchor>
                  <RiTooltip
                    content={
                      isPopoverOpen
                        ? undefined
                        : 'Open Workbench in the left menu to see the command results.'
                    }
                    data-testid="run-btn-open-workbench-tooltip"
                  >
                    <S.RunBtn>
                      <S.ActionBtn>
                        <EmptyButton
                          onClick={handleRunClicked}
                          icon={isRan ? CheckBoldIcon : PlayIcon}
                          iconSide="right"
                          size="small"
                          disabled={isLoading || isRan}
                          loading={isLoading}
                          {...rest}
                          data-testid={`run-btn-${label}`}
                        >
                          Run
                        </EmptyButton>
                      </S.ActionBtn>
                    </S.RunBtn>
                  </RiTooltip>
                </S.PopoverAnchor>
              }
            >
              {getPopoverMessage()}
            </RiPopover>
          )}
        </S.Actions>
      </Row>
      <S.Content data-testid="code-button-block-content">
        <S.Code>
          <CodeBlock>
            {highlightedContent ? parse(highlightedContent) : content}
          </CodeBlock>
        </S.Code>
      </S.Content>
      <Spacer size="s" />
    </S.Wrapper>
  )
}

export default CodeButtonBlock
