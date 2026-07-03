import React, { useEffect, useRef, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { appendArrayElement, addArrayElement } from 'uiSrc/slices/browser/array'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'
import { stringToSerializedBufferFormat } from 'uiSrc/utils'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons'
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
  MOVE_TO_ELEMENT_HINT,
  MOVE_TO_ELEMENT_LABEL,
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
export const ArrayAddForm = ({ closePanel, onReveal }: ArrayAddFormProps) => {
  const dispatch = useAppDispatch()
  const { viewFormat } = useAppSelector(selectedKeySelector)
  // Resolve the target key from the live selection (like the List/Hash add
  // panels), not a captured prop — so a confirm after switching keys writes to
  // the currently selected key rather than a stale one.
  const { name: selectedKey } = useAppSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }
  // The instance/key active when Add is pressed. The thunk cancels the write if
  // the live connection no longer matches — a confirmation left pending across
  // a database switch must not write into the newly selected database.
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)
  const { requestConfirmation } = useProductionWriteConfirmation()

  const [value, setValue] = useState('')
  const [index, setIndex] = useState('')
  // Default on: an append lands past the current window, so without moving the
  // View the new element would be invisible. Users who don't want the jump can
  // opt out per add.
  const [moveToElement, setMoveToElement] = useState(true)
  // handleSuccess is captured by the thunk when Add is confirmed; read the flag
  // from a ref so a toggle while the POST is in flight is honored.
  const moveToElementRef = useRef(moveToElement)
  moveToElementRef.current = moveToElement

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

  const handleSuccess = (addedIndex?: string) => {
    if (!isMounted.current) {
      return
    }
    // Move the View to the new element before closing, so an append past the
    // current window is actually shown (revealIndex no-ops if it's in view).
    if (moveToElementRef.current && addedIndex) {
      onReveal?.(addedIndex)
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
        if (!selectedKey) {
          return
        }
        const serialized = stringToSerializedBufferFormat(viewFormat, value)
        if (trimmedIndex.length === 0) {
          dispatch(
            appendArrayElement(
              {
                key: selectedKey,
                value: serialized,
                expectedInstanceId: instanceId,
              },
              handleSuccess,
            ),
          )
        } else {
          dispatch(
            addArrayElement(
              {
                key: selectedKey,
                index: trimmedIndex,
                value: serialized,
                expectedInstanceId: instanceId,
              },
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
        </Row>
      </EntryContent>

      <Row align="center" gap="s" grow={false}>
        <FlexItem grow={false}>
          <Checkbox
            id={`${TEST_ID}-move-to-element`}
            name="move-to-element"
            label={MOVE_TO_ELEMENT_LABEL}
            checked={moveToElement}
            onChange={(e) => setMoveToElement(e.target.checked)}
            data-testid={`${TEST_ID}-move-to-element`}
          />
        </FlexItem>
        <FlexItem grow={false}>
          <RiTooltip
            content={MOVE_TO_ELEMENT_HINT}
            position="top"
            anchorClassName="inline-flex"
          >
            <RiIcon
              type="InfoIcon"
              size="m"
              data-testid={`${TEST_ID}-move-to-element-info`}
            />
          </RiTooltip>
        </FlexItem>
      </Row>

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
