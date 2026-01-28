import React from 'react'
import { useDispatch } from 'react-redux'
import ExploreGuides from 'uiSrc/components/explore-guides'
import { Nullable } from 'uiSrc/utils'

import { toggleBrowserFullScreen } from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'

import * as S from './NoKeySelected.styles'

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
        <Text textAlign="center">
          <span data-testid="select-key-message">
            Select the key from the list on the left to see the details of the
            key.
          </span>
        </Text>
      ) : (
        <ExploreGuides />
      )}
    </>
  )

  return (
    <>
      <S.CloseRightPanel>
        <RiTooltip content="Close" position="left">
          <S.CloseBtn
            icon={CancelSlimIcon}
            aria-label="Close panel"
            onClick={handleClosePanel}
            data-testid="close-right-panel-btn"
          />
        </RiTooltip>
      </S.CloseRightPanel>

      <S.Placeholder>
        {error ? (
          <Text textAlign="center">
            <span data-testid="no-keys-selected-text">{error}</span>
          </Text>
        ) : (
          !!keysLastRefreshTime && <NoKeysSelectedMessage />
        )}
      </S.Placeholder>
    </>
  )
}
