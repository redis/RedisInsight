import React, { useEffect, useState } from 'react'

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
} from 'uiSrc/components/base/layout/drawer'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { ArrayValueEditorDrawerProps } from './ArrayValueEditorDrawer.types'

// The drawer is full viewport height; leave room for the header + footer so
// the editor fills the rest — the point of the drawer over the inline edit is
// the extra room for large values.
const EDITOR_HEIGHT = 'calc(100vh - 140px)'

/**
 * Right-side drawer hosting a plaintext Monaco editor for a single array
 * element value. Preferred over the inline editor for large values thanks to
 * the extra space. Save funnels through the same ARSET apply path (behind the
 * production-write confirmation) as the inline editor; the editor is plaintext
 * and Save is never validation-gated.
 *
 * Rendered per row and only while open (returns null when closed) so a Monaco
 * instance is never mounted for every row of the table.
 */
export const ArrayValueEditorDrawer = ({
  isOpen,
  index,
  initialValue,
  title = 'Edit value',
  onSave,
  onClose,
}: ArrayValueEditorDrawerProps) => {
  const [value, setValue] = useState(initialValue)

  // Re-seed from initialValue every time the drawer opens, so reopening after
  // a cancel discards the previous in-progress edit. Only reacts to open /
  // initialValue — don't add other reactive deps, or an in-flight edit could
  // be silently discarded.
  useEffect(() => {
    if (isOpen) setValue(initialValue)
  }, [isOpen, initialValue])

  if (!isOpen) return null

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      data-testid="array-value-editor-drawer"
    >
      <DrawerHeader title={title} />
      <DrawerBody>
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
      </DrawerBody>
      <DrawerFooter.Compose>
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
      </DrawerFooter.Compose>
    </Drawer>
  )
}
