import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { monaco } from 'react-monaco-editor'

import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
} from 'uiSrc/components/base/layout/drawer'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { DownloadIcon, EditIcon } from 'uiSrc/components/base/icons'
import { CopyButton } from 'uiSrc/components/copy-button'
import { RiTooltip } from 'uiSrc/components'
import { handleDownloadButton } from 'uiSrc/utils/events'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { useMonacoValidation } from 'uiSrc/components/monaco-editor'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { setVectorSetElementAttribute } from 'uiSrc/slices/browser/vectorSet'
import { bufferToString } from 'uiSrc/utils'
import { formatVector } from './utils'
import {
  VECTOR_DESCRIPTION,
  ATTRIBUTES_DESCRIPTION,
  ATTRIBUTES_EDITOR_OPTIONS,
} from './constants'
import { ElementDetailsProps } from './ElementDetails.types'
import * as S from './ElementDetails.styles'

const ElementDetails = ({
  element,
  isOpen,
  onClose,
  onDrawerDidClose,
}: ElementDetailsProps) => {
  const dispatch = useDispatch()
  const { name: keyName } = useSelector(selectedKeyDataSelector) ?? {}

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { isValid, isValidating } = useMonacoValidation(editorRef)

  const onEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState('')
  const [savedValue, setSavedValue] = useState('')

  useEffect(() => {
    const formatted = bufferToString(element?.attributes)
    setValue(formatted)
    setIsEditing(false)
  }, [element])

  const elementName = useMemo(
    () => (element ? bufferToString(element.name) : ''),
    [element],
  )

  const vectorText = useMemo(
    () => formatVector(element?.vector),
    [element?.vector],
  )

  const handleDownloadVector = useCallback(() => {
    handleDownloadButton(vectorText, `${elementName}_vector.txt`)
  }, [vectorText, elementName])

  const startEditing = useCallback(() => {
    setSavedValue(value)
    setIsEditing(true)
  }, [value])

  const handleCancelEditing = useCallback(() => {
    setValue(savedValue)
    setIsEditing(false)
  }, [savedValue])

  const isValueValid = isValid && !isValidating
  const isSaveDisabled = !isValueValid || value === savedValue

  const handleSave = useCallback(() => {
    if (!element || isSaveDisabled) return

    const trimmed = value.trim()

    // Guard against invalid JSON that can slip through due to a race condition
    // in useMonacoValidation (decorations reset isValidating before markers update isValid)
    let formatted: string
    try {
      formatted = trimmed ? JSON.stringify(JSON.parse(trimmed), null, 2) : ''
    } catch {
      return
    }

    const applyFormatted = () => {
      setIsEditing(false)
      setValue(formatted)
      setSavedValue(formatted)
    }

    if (formatted === savedValue) {
      applyFormatted()
      return
    }

    dispatch(
      setVectorSetElementAttribute(
        keyName as RedisResponseBuffer,
        element.name,
        formatted,
        applyFormatted,
      ),
    )
  }, [dispatch, value, element, keyName, isSaveDisabled, savedValue])

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      onDrawerDidClose={onDrawerDidClose}
      data-test-subj="element-details-panel"
    >
      <DrawerHeader title={elementName} />
      {element && (
        <DrawerBody>
          <S.Body>
            <Col gap="l">
              <Text color="secondary">{VECTOR_DESCRIPTION}</Text>
              <Col gap="s">
                <Text color="primary">Vector</Text>
                <S.VectorWrapper>
                  <S.VectorActions gap="m" align="end">
                    <CopyButton
                      copy={vectorText}
                      aria-label="Copy vector"
                      data-testid="vector-set-copy-vector-btn"
                    />
                    <RiTooltip content="Download" position="left">
                      <IconButton
                        icon={DownloadIcon}
                        aria-label="Download vector"
                        onClick={handleDownloadVector}
                        data-testid="vector-set-download-vector-btn"
                      />
                    </RiTooltip>
                  </S.VectorActions>
                  <S.VectorTextArea
                    readOnly
                    value={vectorText}
                    data-testid="vector-set-vector-value"
                    height="110px"
                  />
                </S.VectorWrapper>
              </Col>
            </Col>

            <Col gap="l">
              <Text color="secondary">{ATTRIBUTES_DESCRIPTION}</Text>
              <Col gap="s">
                <Text color="primary">Attributes</Text>
                <S.EditorWrapper data-testid="vector-set-attributes-json-editor">
                  {!isEditing && (
                    <S.EditButton
                      icon={EditIcon}
                      aria-label="Edit attributes"
                      onClick={startEditing}
                      data-testid="vector-set-edit-attributes-btn"
                    />
                  )}
                  <CodeEditor
                    language="json"
                    value={value}
                    options={{
                      ...ATTRIBUTES_EDITOR_OPTIONS,
                      readOnly: !isEditing,
                    }}
                    onChange={setValue}
                    editorDidMount={onEditorDidMount}
                  />
                </S.EditorWrapper>
              </Col>
              {isEditing && (
                <Row justify="end" gap="m">
                  <SecondaryButton
                    onClick={handleCancelEditing}
                    data-testid="vector-set-cancel-attributes-btn"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    disabled={isSaveDisabled}
                    onClick={handleSave}
                    data-testid="vector-set-save-attributes-btn"
                  >
                    Save
                  </PrimaryButton>
                </Row>
              )}
            </Col>
          </S.Body>
        </DrawerBody>
      )}
    </Drawer>
  )
}

export { ElementDetails }
