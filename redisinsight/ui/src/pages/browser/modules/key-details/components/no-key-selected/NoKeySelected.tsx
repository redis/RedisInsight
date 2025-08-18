import React from 'react'
import { useDispatch } from 'react-redux'
import { CancelSlimIcon } from 'uiBase/icons'
import { RiIconButton } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import ExploreGuides from 'uiSrc/components/explore-guides'
import { Nullable } from 'uiSrc/utils'

import { toggleBrowserFullScreen } from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RiTooltip } from 'uiBase/display'
import styles from './styles.module.scss'

export interface Props {
  keyProp: Nullable<RedisResponseBuffer>
  totalKeys: number
  keysLastRefreshTime: Nullable<number>
  onClosePanel: () => void
  error?: string
}

export const NoKeySelected = (props: Props) => {
  const { keyProp, totalKeys, onClosePanel, error, keysLastRefreshTime } = props

  const dispatch = useDispatch()

  const handleClosePanel = () => {
    dispatch(toggleBrowserFullScreen(true))
    keyProp && onClosePanel()
  }

  const NoKeysSelectedMessage = () => (
    <>
      {totalKeys > 0 ? (
        <span data-testid="select-key-message">
          Select the key from the list on the left to see the details of the
          key.
        </span>
      ) : (
        <ExploreGuides />
      )}
    </>
  )

  return (
    <>
      <RiTooltip
        content="Close"
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <RiIconButton
          icon={CancelSlimIcon}
          aria-label="Close panel"
          className={styles.closeBtn}
          onClick={handleClosePanel}
          data-testid="close-right-panel-btn"
        />
      </RiTooltip>

      <div className={styles.placeholder}>
        <RiText textAlign="center" color="subdued" size="s">
          {error ? (
            <span data-testid="no-keys-selected-text">{error}</span>
          ) : (
            !!keysLastRefreshTime && <NoKeysSelectedMessage />
          )}
        </RiText>
      </div>
    </>
  )
}
