import React from 'react'

import { ToggleButton } from 'uiSrc/components/base/forms/buttons'

export interface ViewIndexButtonProps {
  isActive: boolean
  onClick: () => void
}

export const ViewIndexButton = ({
  isActive,
  onClick,
}: ViewIndexButtonProps) => (
  <ToggleButton
    pressed={isActive}
    onPressedChange={onClick}
    data-testid="view-index-btn"
  >
    View index
  </ToggleButton>
)
