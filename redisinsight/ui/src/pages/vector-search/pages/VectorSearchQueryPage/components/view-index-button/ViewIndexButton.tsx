import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { ToggleButton } from 'uiSrc/components/base/forms/buttons'

export interface ViewIndexButtonProps {
  isActive: boolean
  onClick: () => void
}

export const ViewIndexButton = ({
  isActive,
  onClick,
}: ViewIndexButtonProps) => {
  const { t } = useTranslation()

  return (
    <ToggleButton
      pressed={isActive}
      onPressedChange={onClick}
      data-testid="view-index-btn"
    >
      {t('vectorSearch.query.viewIndexButton')}
    </ToggleButton>
  )
}
