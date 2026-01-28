import React, { useContext, useMemo } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'
import { merge } from 'lodash'

import { Theme, MonacoLanguage } from 'uiSrc/constants'
import { defaultMonacoOptions } from 'uiSrc/constants/monaco/monaco'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { CopyButton } from 'uiSrc/components/copy-button'

import { CommandViewProps } from './CommandView.types'
import { COMMAND_VIEW_EDITOR_OPTIONS } from './CommandView.constants'
import * as S from './CommandView.styles'

export const CommandView = ({
  command,
  language = MonacoLanguage.Redis,
  className,
  dataTestId,
  onCopy,
  showLineNumbers = false,
}: CommandViewProps) => {
  const { theme } = useContext(ThemeContext)

  const editorOptions = useMemo(
    () =>
      merge({}, defaultMonacoOptions, COMMAND_VIEW_EDITOR_OPTIONS, {
        lineNumbers: showLineNumbers ? 'on' : 'off',
      }),
    [showLineNumbers],
  )

  const monacoTheme = theme === Theme.Dark ? 'dark' : 'light'

  return (
    <S.EditorWrapper className={className} data-testid={dataTestId}>
      <ReactMonacoEditor
        language={language}
        theme={monacoTheme}
        value={command}
        options={editorOptions}
        data-testid={`${dataTestId ?? 'command-view'}--editor`}
      />
      <S.CopyButtonWrapper>
        <CopyButton
          copy={command}
          successLabel="Copied"
          onCopy={onCopy}
          data-testid={`${dataTestId ?? 'command-view'}--copy-button`}
          aria-label="Copy command"
        />
      </S.CopyButtonWrapper>
    </S.EditorWrapper>
  )
}
