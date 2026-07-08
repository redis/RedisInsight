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

// Fill the drawer height minus its header and footer.
const EDITOR_HEIGHT = 'calc(100vh - 140px)'

/**
 * Right-side drawer with a plaintext Monaco editor for a single array element
 * value — more room for large values than the inline editor. Rendered per row
 * and only while open (returns null when closed) so a Monaco instance is never
 * mounted for every row of the table.
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

  // Re-seed on open so reopening after a cancel discards the previous edit.
  // Don't add other deps, or an in-flight edit could be silently discarded.
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
