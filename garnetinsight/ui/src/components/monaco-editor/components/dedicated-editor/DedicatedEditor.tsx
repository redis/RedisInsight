import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { compact, findIndex, first, merge } from 'lodash'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import ReactMonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import { Rnd } from 'react-rnd'
import cx from 'classnames'

import {
  decoration,
  getMonacoAction,
  MonacoAction,
  Nullable,
  toModelDeltaDecoration,
} from 'uiSrc/utils'
import {
  DEDICATED_EDITOR_LANGUAGES,
  DSL,
  MonacoLanguage,
  MonacoSyntaxLang,
  Theme,
} from 'uiSrc/constants'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon, CheckThinIcon } from 'uiSrc/components/base/icons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import styles from './styles.module.scss'

const LangSelect = styled(RiSelect)`
  appearance: none;
  border: 0 none;
  outline: none;
  background-color: transparent;
  max-width: 200px;
  max-height: 26px;
  &:active,
  &:focus,
  &:hover,
  &[data-state='open'] {
    background-color: transparent;
  }
`

export interface Props {
  query?: string
  langId?: DSL
  langs?: DSL[]
  onChangeLanguage?: (langId: DSL) => void
  onSubmit: (query: string, langId: DSL) => void
  onCancel: (langId: DSL) => void
  initialHeight: number
  customOptions?: monacoEditor.editor.IStandaloneEditorConstructionOptions
  keywords?: string[]
  functions?: monacoEditor.languages.CompletionItem[]
}

// paddings of main editor
const WRAPPER_PADDINGS_HEIGHT = 18
const BOTTOM_INDENT_PADDING = 6

const notCommandRegEx = /^\s|\/\//
let decorationCollection: Nullable<monacoEditor.editor.IEditorDecorationsCollection> =
  null

const DedicatedEditor = (props: Props) => {
  const {
    initialHeight,
    query = '',
    langId,
    langs = [],
    onChangeLanguage,
    onCancel,
    onSubmit,
    customOptions = {},
    keywords,
    functions,
  } = props

  const [value, setValue] = useState<string>(query)
  const [height, setHeight] = useState(initialHeight)
  const [selectedLang, setSelectedLang] = useState(
    DEDICATED_EDITOR_LANGUAGES[!langs.length ? langId! : first(langs)!],
  )
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  const rndRef = useRef<Nullable<any>>(null)

  const { theme } = useContext(ThemeContext)

  const optionsLangs = langs.map((lang) => ({
    value: lang,
    label: DEDICATED_EDITOR_LANGUAGES[lang]?.name,
  }))

  let disposeCompletionItemProvider = () => {}

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        disposeCompletionItemProvider()
      },
    [],
  )

  useEffect(() => {
    if (height === 0) return

    const rndHeight = rndRef.current?.resizableElement.current.offsetHeight || 0
    const rndTop = rndRef.current?.draggable.state.y
    if (height < rndTop + rndHeight + WRAPPER_PADDINGS_HEIGHT) {
      rndRef?.current.updatePosition({
        x: 0,
        y: height - rndHeight - WRAPPER_PADDINGS_HEIGHT,
      })
    }
  }, [height])

  useEffect(() => {
    if (!monacoObjects.current) return
    const commands = value.split('\n')
    const { monaco } = monacoObjects.current

    const newDecorations = compact(
      commands.map((command, index) => {
        if (!command || notCommandRegEx.test(command)) return null
        const lineNumber = index + 1

        return toModelDeltaDecoration(
          decoration(
            monaco,
            `decoration_${lineNumber}`,
            lineNumber,
            1,
            lineNumber,
            1,
          ),
        )
      }),
    )

    decorationCollection?.set(newDecorations)
  }, [value])

  const onResize = ({ height }: Size): void => {
    setHeight(height!)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel(selectedLang.id as DSL)
    }
  }

  const handleSubmit = () => {
    const { editor } = monacoObjects?.current || {}
    const val = editor
      ?.getValue()
      .split('\n')
      .map((line: string, i: number) =>
        i > 0 && !notCommandRegEx.test(line) ? `\t${line}` : line,
      )
      .join('\n')
    onSubmit(val || '', selectedLang.id as DSL)
  }

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monacoObjects.current = {
      editor,
      monaco,
    }

    setTimeout(() => editor.focus(), 0)

    setupMonacoLang(monaco, selectedLang)
    editor.addAction(
      getMonacoAction(MonacoAction.Submit, () => handleSubmit(), monaco),
    )

    decorationCollection = editor.createDecorationsCollection()
  }

  const setupMonacoLang = (
    monaco: typeof monacoEditor,
    selectedLang: MonacoSyntaxLang,
  ) => {
    const languages = monaco.languages.getLanguages()

    if (!selectedLang) return

    const isLangRegistered =
      findIndex(languages, { id: selectedLang.language }) > -1
    if (isLangRegistered) {
      return
    }
    monaco.languages.register({ id: selectedLang.language })

    monaco.languages.setLanguageConfiguration(
      selectedLang.language,
      selectedLang.config!,
    )

    disposeCompletionItemProvider =
      monaco.languages.registerCompletionItemProvider(
        selectedLang.language,
        selectedLang.completionProvider?.(keywords, functions)!,
      ).dispose

    try {
      monaco.languages.setMonarchTokensProvider(
        selectedLang.language,
        selectedLang.tokensProvider?.(keywords, functions)!,
      )
    } catch (exception) {
      console.error(
        `Monaco ${selectedLang.language} language setup error: `,
        exception,
      )
    }
  }

  const onChangeLanguageSelect = (id: string) => {
    const selectedLang = DEDICATED_EDITOR_LANGUAGES[id]
    setSelectedLang(selectedLang)

    setupMonacoLang(monacoObjects.current?.monaco!, selectedLang)

    onChangeLanguage?.(id as DSL)
  }

  const options: monacoEditor.editor.IStandaloneEditorConstructionOptions =
    merge(
      {
        tabCompletion: 'on',
        wordWrap: 'on',
        padding: { top: 10 },
        automaticLayout: true,
        formatOnPaste: false,
        suggest: {
          preview: false,
          showStatusBar: false,
          showIcons: true,
        },
        minimap: {
          enabled: false,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        lineNumbersMinChars: 4,
      },
      customOptions,
    )

  return (
    <AutoSizer onResize={onResize}>
      {() => (
        <div className="editorBounder">
          <Rnd
            ref={rndRef}
            default={{
              x: 0,
              y: initialHeight * 0.4 - BOTTOM_INDENT_PADDING,
              width: '100%',
              height: '60%',
            }}
            minHeight="80px"
            enableResizing={{
              top: true,
              right: false,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
            resizeHandleClasses={{
              top: 't_resize-top',
              bottom: 't_resize-bottom',
            }}
            dragAxis="y"
            bounds=".editorBounder"
            dragHandleClassName="draggable-area"
            className={styles.rnd}
            data-testid="draggable-area"
          >
            <div
              className={styles.container}
              onKeyDown={handleKeyDown}
              role="textbox"
              tabIndex={0}
            >
              <div className="draggable-area" />
              <div className={styles.input} data-testid="query-input-container">
                <ReactMonacoEditor
                  language={selectedLang?.language || MonacoLanguage.Cypher}
                  theme={theme === Theme.Dark ? 'dark' : 'light'}
                  value={value}
                  onChange={setValue}
                  options={options}
                  className={`${langId}-editor`}
                  editorDidMount={editorDidMount}
                />
              </div>
              <div className={cx(styles.actions)}>
                {langs?.length < 2 && <span>{selectedLang?.name}</span>}
                {langs?.length >= 2 && (
                  <LangSelect
                    name="dedicated-editor-language-select"
                    placeholder="Select language"
                    value={selectedLang.id}
                    options={optionsLangs}
                    onChange={onChangeLanguageSelect}
                    data-testid="dedicated-editor-language-select"
                  />
                )}
                <div>
                  <IconButton
                    icon={CancelSlimIcon}
                    aria-label="Cancel editing"
                    className={styles.declineBtn}
                    onClick={() => onCancel(selectedLang.id as DSL)}
                    data-testid="cancel-btn"
                  />
                  <IconButton
                    icon={CheckThinIcon}
                    type="submit"
                    aria-label="Apply"
                    onClick={handleSubmit}
                    className={styles.applyBtn}
                    data-testid="apply-btn"
                  />
                </div>
              </div>
            </div>
          </Rnd>
        </div>
      )}
    </AutoSizer>
  )
}

export default React.memo(DedicatedEditor)
