import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

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
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { fetchDownloadVectorEmbedding } from 'uiSrc/slices/browser/vectorSet'
import { bufferToString } from 'uiSrc/utils'
import { AttributeEditor } from '../attribute-editor'
import { useElementAttributeEditor } from '../hooks'
import { formatVector } from './utils'
import { VECTOR_DESCRIPTION, ATTRIBUTES_DESCRIPTION } from './constants'
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

  const {
    isEditing,
    value,
    isSaveDisabled,
    onChange,
    startEditing,
    cancelEditing,
    saveAttribute,
  } = useElementAttributeEditor({ element })

  const elementName = useMemo(
    () => (element ? bufferToString(element.name) : ''),
    [element],
  )

  const isTruncatedVector = element?.vectorTruncated ?? false

  const vectorText = useMemo(
    () => formatVector(element?.vector, isTruncatedVector),
    [element?.vector, isTruncatedVector],
  )

  const handleDownloadVector = () => {
    if (!element || !keyName) return
    dispatch(
      fetchDownloadVectorEmbedding(
        keyName as RedisResponseBuffer,
        element.name,
        downloadFile,
      ),
    )
  }

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
                    {isTruncatedVector ? (
                      <RiTooltip content="Download" position="left">
                        <IconButton
                          icon={DownloadIcon}
                          aria-label="Download vector"
                          onClick={handleDownloadVector}
                          data-testid="vector-set-download-vector-btn"
                        />
                      </RiTooltip>
                    ) : (
                      <CopyButton
                        copy={vectorText}
                        aria-label="Copy vector"
                        data-testid="vector-set-copy-vector-btn"
                      />
                    )}
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
                  <AttributeEditor
                    key={elementName}
                    value={value}
                    onChange={onChange}
                    isInEditMode={isEditing}
                    testId="vector-set-attributes-editor"
                  />
                </S.EditorWrapper>
              </Col>
              {isEditing && (
                <Row justify="end" gap="m">
                  <SecondaryButton
                    onClick={cancelEditing}
                    data-testid="vector-set-cancel-attributes-btn"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    disabled={isSaveDisabled}
                    onClick={saveAttribute}
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
