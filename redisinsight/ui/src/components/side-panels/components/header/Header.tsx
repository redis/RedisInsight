import React from 'react'

import { FullScreen } from 'uiSrc/components'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import * as S from '../../SidePanels.styles'

export interface Props {
  panelName?: string
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onClose: () => void
  children: React.ReactNode
}

const Header = (props: Props) => {
  const {
    panelName = '',
    isFullScreen,
    onToggleFullScreen,
    onClose,
    children,
  } = props
  return (
    <S.Header>
      {children}
      <FullScreen
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        btnTestId={`fullScreen-${panelName}-btn`}
      />
      <S.CloseBtn
        as={IconButton}
        icon={CancelSlimIcon}
        aria-label="close insights"
        onClick={onClose}
        data-testid={`close-${panelName}-btn`}
      />
    </S.Header>
  )
}

export default Header
