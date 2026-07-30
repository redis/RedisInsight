import React from 'react'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import ExploreGuides from 'uiSrc/components/explore-guides'
import { Nullable } from 'uiSrc/utils'

import { toggleBrowserFullScreen } from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'
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

  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleClosePanel = () => {
    dispatch(toggleBrowserFullScreen(true))
    keyProp && onClosePanel()
  }

  const NoKeysSelectedMessage = () => (
    <>
      {totalKeys > 0 ? (
        <Text textAlign="center">
          <span data-testid="select-key-message">
            {t('browser.keyDetails.noKeySelected.message')}
          </span>
        </Text>
      ) : (
        <ExploreGuides />
      )}
    </>
  )

  return (
    <>
      <RiTooltip
        content={t('browser.keyDetails.noKeySelected.closeTooltip')}
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <IconButton
          icon={CancelSlimIcon}
          aria-label={t('browser.keyDetails.noKeySelected.closeAria')}
          className={styles.closeBtn}
          onClick={handleClosePanel}
          data-testid="close-right-panel-btn"
        />
      </RiTooltip>

      <div className={styles.placeholder}>
        {error ? (
          <Text textAlign="center">
            <span data-testid="no-keys-selected-text">{error}</span>
          </Text>
        ) : (
          !!keysLastRefreshTime && <NoKeysSelectedMessage />
        )}
      </div>
    </>
  )
}
