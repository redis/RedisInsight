import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { RiIconButton } from 'uiSrc/components/base/forms'
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
      <RiIconButton
        size="S"
        icon={EditIcon}
        onClick={switchEditorType}
        aria-label="Change editor type"
        disabled={isDisabled}
      />
    </RiTooltip>
  )
}

export default ChangeEditorTypeButton

export class ButtonMode {}
