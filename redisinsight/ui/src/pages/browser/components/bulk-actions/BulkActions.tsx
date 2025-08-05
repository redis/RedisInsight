import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
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

import { RiCol, RiFlexItem } from 'uiSrc/components/base/layout'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { RiTitle } from 'uiSrc/components/base/text'
import BulkUpload from './BulkUpload'
import BulkDelete from './BulkDelete'
import BulkActionsTabs from './BulkActionsTabs'
import styles from './styles.module.scss'

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
    <div className={styles.page}>
      <RiCol justify="center" className={cx(styles.container, 'relative')}>
        <RiFlexItem grow style={{ marginBottom: '16px' }}>
          <RiTitle size="M" className={styles.title}>
            Bulk Actions
          </RiTitle>
          {!arePanelsCollapsed && (
            <FullScreen
              isFullScreen={isFullScreen}
              onToggleFullScreen={onToggleFullScreen}
              anchorClassName={cx(
                styles.anchorTooltip,
                styles.anchorTooltipFullScreen,
              )}
            />
          )}
          {(!arePanelsCollapsed || isFullScreen) && (
            <RiTooltip
              content="Close"
              position="left"
              anchorClassName={styles.anchorTooltip}
            >
              <RiIconButton
                icon={CancelSlimIcon}
                aria-label="Close panel"
                className={cx(styles.closeBtn, styles.anchorTooltip)}
                data-testid="bulk-close-panel"
                onClick={closePanel}
              />
            </RiTooltip>
          )}
        </RiFlexItem>
        <div className="eui-yScroll">
          <div
            className={styles.contentActions}
            data-testid="bulk-actions-content"
          >
            <BulkActionsTabs onChangeType={handleChangeType} />
            {type === BulkActionsType.Upload && (
              <BulkUpload onCancel={closePanel} />
            )}
            {type === BulkActionsType.Delete && (
              <BulkDelete onCancel={closePanel} />
            )}
          </div>
        </div>
      </RiCol>
    </div>
  )
}

export default BulkActions
