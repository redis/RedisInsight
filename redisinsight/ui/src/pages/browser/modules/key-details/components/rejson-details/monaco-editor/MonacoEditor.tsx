import React, { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { monaco } from 'react-monaco-editor'

import {
  MonacoEditor as Editor,
  useMonacoValidation,
} from 'uiSrc/components/monaco-editor'
import { setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { CopyButton } from 'uiSrc/components/copy-button'
import { BaseProps } from '../interfaces'
import { useChangeEditorType } from '../../change-editor-type-button'
import { jsonToReadableString } from '../utils'

import styles from '../styles.module.scss'
import * as S from './MonacoEditor.styles'

const ROOT_PATH = '$'

const MonacoEditor = (props: BaseProps) => {
  const { data, length, selectedKey } = props
  const dispatch = useAppDispatch()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const originalData = jsonToReadableString(data)
  const [value, setValue] = useState(originalData)

  const { viewType } = useAppSelector(keysSelector)
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)

  const { isValid, isValidating } = useMonacoValidation(editorRef)
  const isButtonEnabled = isValid && !isValidating && originalData !== value

  const onEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleCopy = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_JSON_VALUE_COPIED,
        TelemetryEvent.TREE_VIEW_JSON_VALUE_COPIED,
      ),
      eventData: { databaseId: instanceId },
    })
  }

  const { switchEditorType } = useChangeEditorType()

  const submitUpdate = () => {
    dispatch(setReJSONDataAction(selectedKey, ROOT_PATH, value, true, length))
  }

  return (
    <div
      className={styles.monacoEditorJsonData}
      id="monaco-editor-json-data"
      data-testid="monaco-editor-json-data"
    >
      <S.EditorContainer>
        <Editor
          language="json"
          value={value}
          isEditable
          onChange={setValue}
          data-testid="json-data-editor"
          wrapperClassName={styles.editor}
          editorWrapperClassName={styles.editorWrapper}
          onEditorDidMount={onEditorDidMount}
        />
        <S.CopyButtonWrapper>
          <CopyButton
            copy={value}
            onCopy={handleCopy}
            aria-label="Copy value"
            data-testid="copy-json-editor-value"
          />
        </S.CopyButtonWrapper>
      </S.EditorContainer>
      <Spacer size="m" />
      <Row justify="end" gap="m" className={styles.actions}>
        <SecondaryButton
          onClick={switchEditorType}
          data-testid="json-data-cancel-btn"
        >
          Close
        </SecondaryButton>

        <PrimaryButton
          disabled={!isButtonEnabled}
          onClick={submitUpdate}
          data-testid="json-data-update-btn"
        >
          Overwrite Data
        </PrimaryButton>
      </Row>
    </div>
  )
}

export default MonacoEditor
