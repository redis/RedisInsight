import React from 'react'
import { useTranslation } from 'uiSrc/i18n'
import { ExtendIcon, ShrinkIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  anchorClassName?: string
  btnTestId?: string
}

const FullScreen = ({
  isFullScreen,
  onToggleFullScreen,
  anchorClassName = '',
  btnTestId = 'toggle-full-screen',
}: Props) => {
  const { t } = useTranslation()
  return (
    <RiTooltip
      content={
        isFullScreen
          ? t('common.fullScreen.exit')
          : t('common.fullScreen.enter')
      }
      position="left"
      anchorClassName={anchorClassName}
    >
      <IconButton
        icon={isFullScreen ? ShrinkIcon : ExtendIcon}
        color="primary"
        aria-label={t('common.fullScreen.openAria')}
        onClick={onToggleFullScreen}
        data-testid={btnTestId}
      />
    </RiTooltip>
  )
}

export { FullScreen }
