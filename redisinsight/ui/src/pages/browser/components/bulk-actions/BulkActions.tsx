import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  selectedBulkActionsSelector,
  setBulkActionsInitialState,
  setBulkActionType,
} from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType } from 'uiSrc/constants'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import {
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { FullScreen, RiTooltip } from 'uiSrc/components'

import { Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import BulkUpload from './BulkUpload'
import BulkDelete from './BulkDelete'
import BulkActionsTabs from './BulkActionsTabs'
import * as S from './BulkActions.styles'

export interface Props {
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onBulkActionsPanel: (value: boolean) => void
  onClosePanel: () => void
  onToggleFullScreen: () => void
}
const BulkActions = (props: Props) => {
  const {
    isFullScreen,
    arePanelsCollapsed,
    onClosePanel,
    onBulkActionsPanel,
    onToggleFullScreen,
  } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { filter, search } = useSelector(keysSelector)
  const { type } = useSelector(selectedBulkActionsSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_OPENED,
      eventData: {
        databaseId: instanceId,
        filter: {
          filter,
          match:
            search && search !== DEFAULT_SEARCH_MATCH
              ? getMatchType(search)
              : DEFAULT_SEARCH_MATCH,
        },
        action: type,
      },
    })
  }, [])

  const handleChangeType = (value: BulkActionsType) => {
    dispatch(setBulkActionType(value))
  }

  const closePanel = () => {
    onBulkActionsPanel(false)
    dispatch(setBulkActionsInitialState())

    onClosePanel()

    const eventData: Record<string, any> = {
      databaseId: instanceId,
      action: type,
    }

    if (type === BulkActionsType.Delete) {
      eventData.filter = {
        match:
          search && search !== DEFAULT_SEARCH_MATCH
            ? getMatchType(search)
            : DEFAULT_SEARCH_MATCH,
        type: filter,
      }
    }

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_CANCELLED,
      eventData,
    })
  }

  return (
    <S.BulkActionsPage>
      <S.BulkActionsContainer justify="center" gap="l">
        <S.BulkActionsHeader align="center" justify="between">
          <Title size="M">Bulk Actions</Title>
          <Row align="center" gap="s" grow={false}>
            {!arePanelsCollapsed && (
              <S.AnchorTooltipFullScreen>
                <FullScreen
                  isFullScreen={isFullScreen}
                  onToggleFullScreen={onToggleFullScreen}
                />
              </S.AnchorTooltipFullScreen>
            )}
            {(!arePanelsCollapsed || isFullScreen) && (
              <S.AnchorTooltip>
                <RiTooltip content="Close" position="left">
                  <IconButton
                    icon={CancelSlimIcon}
                    aria-label="Close panel"
                    data-testid="bulk-close-panel"
                    onClick={closePanel}
                  />
                </RiTooltip>
              </S.AnchorTooltip>
            )}
          </Row>
        </S.BulkActionsHeader>
        <S.BulkActionsScrollPanel>
          <S.BulkActionsContentActions data-testid="bulk-actions-content">
            <BulkActionsTabs onChangeType={handleChangeType} />
            {type === BulkActionsType.Upload && (
              <BulkUpload onCancel={closePanel} />
            )}
            {type === BulkActionsType.Delete && (
              <BulkDelete onCancel={closePanel} />
            )}
          </S.BulkActionsContentActions>
        </S.BulkActionsScrollPanel>
      </S.BulkActionsContainer>
    </S.BulkActionsPage>
  )
}

export default BulkActions
