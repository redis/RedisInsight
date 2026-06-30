import React, { useEffect, useRef, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { appendArrayElement, addArrayElement } from 'uiSrc/slices/browser/array'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'
import { stringToSerializedBufferFormat } from 'uiSrc/utils'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { EntryContent } from '../../common/AddKeysContainer.styled'
import {
  ARRAY_ADD_FORM_TEST_ID as TEST_ID,
  ADD_BUTTON_LABEL,
  CANCEL_BUTTON_LABEL,
  CONFIRM_BUTTON_TEXT,
  CONFIRM_DESCRIPTION,
  CONFIRM_TITLE,
  INDEX_HINT,
  INDEX_LABEL,
  INDEX_PLACEHOLDER,
  INVALID_INDEX_MESSAGE,
  VALUE_LABEL,
} from './ArrayAddForm.constants'
import { ArrayAddFormProps } from './ArrayAddForm.types'

/**
 * Content of the "Add element" slide-out panel (rendered inside the shared
 * `AddKeysContainer`, matching List / Vector Set). The index is optional:
 * leaving it empty appends to the end (POST /array/append, ARSET at the current
 * length); providing one sets at that index (POST /array/set-element).
 * `ARINSERT` is intentionally not used — see docs/array-modify-vertical-plan.md.
 */
export const ArrayAddForm = ({ keyProp, closePanel }: ArrayAddFormProps) => {
  const dispatch = useAppDispatch()
  const { viewFormat } = useAppSelector(selectedKeySelector)
  const { requestConfirmation } = useProductionWriteConfirmation()

  const [value, setValue] = useState('')
  const [index, setIndex] = useState('')

  // A write resolves asynchronously and the slice still fires onSuccess while
  // its target key is selected. But the user may have closed this panel (key
  // switch, then reopened a fresh panel) before it resolved — this instance is
  // unmounted, and running closePanel would discard the *current* panel. Ignore
  // the callback once this form is gone.
  const isMounted = useRef(true)
  useEffect(
    () => () => {
      isMounted.current = false
    },
    [],
  )

  // The index input is optional (empty → append). When provided it must be a
  // canonical decimal string, matching the backend @IsArrayIndex validator.
  const trimmedIndex = index.trim()
  const indexInvalid =
    trimmedIndex.length > 0 && parseArrayIndex(trimmedIndex) !== trimmedIndex

  const handleSuccess = () => {
    if (!isMounted.current) {
      return
    }
    setValue('')
    setIndex('')
    closePanel()
  }

  const handleAdd = () => {
    requestConfirmation({
      title: CONFIRM_TITLE,
      actionDescription: CONFIRM_DESCRIPTION,
      confirmButtonText: CONFIRM_BUTTON_TEXT,
      commandId: BrowserConfirmationCommandId.AddArrayElements,
      disableConfirmationInput: true,
      onConfirm: () => {
        const serialized = stringToSerializedBufferFormat(viewFormat, value)
        if (trimmedIndex.length === 0) {
          dispatch(
            appendArrayElement(
              { key: keyProp, value: serialized },
              handleSuccess,
            ),
          )
        } else {
          dispatch(
            addArrayElement(
              { key: keyProp, index: trimmedIndex, value: serialized },
              handleSuccess,
            ),
          )
        }
      },
    })
  }

  return (
    <Col gap="m">
      <EntryContent gap="m" data-testid={TEST_ID}>
        <Row align="end" gap="m">
          <FlexItem grow>
            <FormField label={VALUE_LABEL}>
              <TextInput
                value={value}
                onChange={setValue}
                placeholder="Enter value"
                data-testid={`${TEST_ID}-value`}
              />
            </FormField>
          </FlexItem>
          <FlexItem>
            <FormField
              label={INDEX_LABEL}
              infoIconProps={{ content: INDEX_HINT }}
            >
              <TextInput
                value={index}
                onChange={setIndex}
                placeholder={INDEX_PLACEHOLDER}
                error={indexInvalid ? INVALID_INDEX_MESSAGE : undefined}
                data-testid={`${TEST_ID}-index`}
              />
            </FormField>
          </FlexItem>
        </Row>
      </EntryContent>

      <Row justify="end" gap="m" grow={false}>
        <FlexItem grow={false}>
          <SecondaryButton
            onClick={() => closePanel(true)}
            data-testid={`${TEST_ID}-cancel`}
          >
            {CANCEL_BUTTON_LABEL}
          </SecondaryButton>
        </FlexItem>
        <FlexItem grow={false}>
          <PrimaryButton
            onClick={handleAdd}
            disabled={indexInvalid}
            data-testid={`${TEST_ID}-submit`}
          >
            {ADD_BUTTON_LABEL}
          </PrimaryButton>
        </FlexItem>
      </Row>
    </Col>
  )
}
