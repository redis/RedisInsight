import React from 'react'
import { ExtendIcon, ShrinkIcon } from 'uiSrc/components/base/icons'
import { RiIconButton } from 'uiSrc/components/base/forms'
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
}: Props) => (
  <RiTooltip
    content={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
    position="left"
    anchorClassName={anchorClassName}
  >
    <RiIconButton
      icon={isFullScreen ? ShrinkIcon : ExtendIcon}
      color="primary"
      aria-label="Open full screen"
      onClick={onToggleFullScreen}
      data-testid={btnTestId}
    />
  </RiTooltip>
)

export { FullScreen }
