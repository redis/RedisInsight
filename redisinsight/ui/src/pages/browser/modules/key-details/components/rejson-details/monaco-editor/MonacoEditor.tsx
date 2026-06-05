import React, { useRef, useState } from 'react'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import { monaco } from 'react-monaco-editor'

import {
  MonacoEditor as Editor,
  useMonacoValidation,
} from 'uiSrc/components/monaco-editor'
import { setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { BaseProps } from '../interfaces'
import { useChangeEditorType } from '../../change-editor-type-button'
import { jsonToReadableString } from '../utils'

import styles from '../styles.module.scss'

const ROOT_PATH = '$'

const MonacoEditor = (props: BaseProps) => {
  const { data, length, selectedKey } = props
  const dispatch = useAppDispatch()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const originalData = jsonToReadableString(data)
  const [value, setValue] = useState(originalData)

  const { isValid, isValidating } = useMonacoValidation(editorRef)
  const isButtonEnabled = isValid && !isValidating && originalData !== value

  const onEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
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
