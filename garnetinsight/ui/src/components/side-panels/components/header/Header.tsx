import React from 'react'

import { FullScreen } from 'uiSrc/components'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

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
    <div className={styles.header}>
      {children}
      <FullScreen
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        btnTestId={`fullScreen-${panelName}-btn`}
      />
      <IconButton
        icon={CancelSlimIcon}
        aria-label="close insights"
        className={styles.closeBtn}
        onClick={onClose}
        data-testid={`close-${panelName}-btn`}
      />
    </div>
  )
}

export default Header
