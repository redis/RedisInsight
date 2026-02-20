import React from 'react'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

export interface ViewIndexButtonProps {
  onClick: () => void
}

export const ViewIndexButton = ({ onClick }: ViewIndexButtonProps) => (
  <EmptyButton size="small" onClick={onClick} data-testid="view-index-btn">
    View index
  </EmptyButton>
)
