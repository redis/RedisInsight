import React, { useEffect, useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { ArrayValueEditorModalProps } from './ArrayValueEditorModal.types'

const EDITOR_HEIGHT = '60vh'
// Wider than the default dialog so multi-line values have room to breathe;
// capped to the viewport so it stays usable on narrow screens.
const MODAL_WIDTH = 'min(900px, 90vw)'

/**
 * Modal plaintext Monaco editor for a single array element value. A roomier
 * alternative to the inline textarea; Save funnels through the same ARSET
 * apply path the inline editor uses. Values are arbitrary strings, so the
 * editor is plaintext and Save is never validation-gated.
 */
export const ArrayValueEditorModal = ({
  isOpen,
  index,
  initialValue,
  title = 'Edit value',
  onSave,
  onClose,
}: ArrayValueEditorModalProps) => {
  const [value, setValue] = useState(initialValue)

  // Re-seed from initialValue every time the modal opens, so reopening after
  // a cancel discards the previous in-progress edit. The modal unmounts when
  // closed and `initialValue` is stable while open, so this intentionally
  // does not react to a live buffer while editing — don't add other reactive
  // deps here, or an in-flight edit could be silently discarded.
  useEffect(() => {
    if (isOpen) setValue(initialValue)
  }, [isOpen, initialValue])

  if (!isOpen) return null

  return (
    <Modal.Compose open>
      <Modal.Content.Compose persistent onCancel={onClose}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onClose}
          data-testid="array-value-editor-close-btn"
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title data-testid="array-value-editor-title">
            {title}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Modal.Content.Body
          width={MODAL_WIDTH}
          content={
            <CodeEditor
              language="plaintext"
              value={value}
              onChange={setValue}
              height={EDITOR_HEIGHT}
              data-testid="array-value-code-editor"
              options={{
                wordWrap: 'on',
                automaticLayout: true,
                minimap: { enabled: false },
              }}
            />
          }
        />

        <Modal.Content.Footer.Compose>
          <Modal.Content.Footer.Group>
            <Row gap="m" justify="end">
              <SecondaryButton
                size="l"
                onClick={onClose}
                data-testid="array-value-editor-cancel-btn"
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                size="l"
                onClick={() => onSave(value)}
                data-testid="array-value-editor-save-btn"
                aria-label={`Save value for index ${index}`}
              >
                Save
              </PrimaryButton>
            </Row>
          </Modal.Content.Footer.Group>
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}
