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
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
import {
  MonacoEditor as Editor,
  useMonacoValidation,
} from 'uiSrc/components/monaco-editor'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { setVectorSetElementAttribute } from 'uiSrc/slices/browser/vectorSet'
import { bufferToString } from 'uiSrc/utils'
import { formatVector } from './utils'
import { VECTOR_DESCRIPTION, ATTRIBUTES_DESCRIPTION } from './constants'
import { ElementDetailsProps } from './ElementDetails.types'
import * as S from './ElementDetails.styles'

const ElementDetails = ({ element, isOpen, onClose }: ElementDetailsProps) => {
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

  useEffect(() => {
    if (isEditing) {
      setSavedValue(value)
    }
  }, [isEditing])

  const vectorText = useMemo(
    () => formatVector(element?.vector),
    [element?.vector],
  )

  const handleCancelEditing = useCallback(() => {
    setValue(savedValue)
    setIsEditing(false)
  }, [savedValue])

  const isValueEmpty = value.trim() === ''
  const isValueValid = isValueEmpty || (isValid && !isValidating)
  const isSaveDisabled = !isValueValid || value === savedValue

  const handleSave = useCallback(() => {
    if (!element || isSaveDisabled) return

    const trimmed = value.trim()
    const formatted = trimmed
      ? JSON.stringify(JSON.parse(trimmed), null, 2)
      : ''

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

  if (!element) return null

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      data-test-subj="element-details-panel"
    >
      <DrawerHeader title={elementName} />
      <DrawerBody>
        <S.Body>
          <Col gap="l">
            <Text color="secondary">{VECTOR_DESCRIPTION}</Text>
            <Col gap="s">
              <Text color="primary">Vector</Text>
              <S.VectorTextArea
                readOnly
                value={vectorText}
                data-testid="vector-set-vector-value"
                height="110px"
              />
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
                    onClick={() => setIsEditing(true)}
                    data-testid="vector-set-edit-attributes-btn"
                  />
                )}
                <Editor
                  language="json"
                  value={value}
                  readOnly={!isEditing}
                  onChange={setValue}
                  onEditorDidMount={onEditorDidMount}
                  data-testid="vector-set-json-editor"
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
                  disabled={!isValid || isValidating || value === savedValue}
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
    </Drawer>
  )
}

export { ElementDetails }
