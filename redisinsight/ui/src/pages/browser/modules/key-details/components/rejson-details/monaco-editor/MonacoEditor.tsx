import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { EuiFlexItem } from '@elastic/eui'
import { monaco } from 'react-monaco-editor'
import JSONbig from 'json-bigint'

import {
  MonacoEditor as Editor,
  useMonacoValidation,
} from 'uiSrc/components/monaco-editor'
import { setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import { RiPrimaryButton, RiSecondaryButton } from 'uiSrc/components/base/forms'
import { BaseProps } from '../interfaces'
import { useChangeEditorType } from '../../change-editor-type-button'

import styles from '../styles.module.scss'

const ROOT_PATH = '$'

// We use `storeAsString: true` to ensure large numbers are serialized as strings.
// This avoids precision loss for values larger than Number.MAX_SAFE_INTEGER (2^53 - 1),
// which would otherwise be inaccurately represented in JavaScript.
// Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
const jsonToReadableString = (data: any) =>
  JSONbig({ storeAsString: true }).stringify(data, null, 2)

const MonacoEditor = (props: BaseProps) => {
  const { data, length, selectedKey } = props
  const dispatch = useDispatch()
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

      <EuiFlexItem className={styles.actions}>
        <RiSecondaryButton
          onClick={switchEditorType}
          data-testid="json-data-cancel-btn"
        >
          Close
        </RiSecondaryButton>

        <RiPrimaryButton
          disabled={!isButtonEnabled}
          onClick={submitUpdate}
          data-testid="json-data-update-btn"
        >
          Overwrite Data
        </RiPrimaryButton>
      </EuiFlexItem>
    </div>
  )
}

export default MonacoEditor
