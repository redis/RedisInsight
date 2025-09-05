import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
import { useChangeEditorType } from './useChangeEditorType'

const ChangeEditorTypeButton = () => {
  const { switchEditorType, isTextEditorDisabled } = useChangeEditorType()

  const isDisabled = isTextEditorDisabled
  const tooltip = isTextEditorDisabled
    ? 'This JSON document is too large to view or edit in full.'
    : 'Edit value in text editor'

  return (
    <RiTooltip content={tooltip} position="right">
      <IconButton
        size="S"
        icon={EditIcon}
        onClick={switchEditorType}
        aria-label="Change editor type"
        disabled={isDisabled}
        data-testid="change-editor-type"
      />
    </RiTooltip>
  )
}

export default ChangeEditorTypeButton

export class ButtonMode {}
