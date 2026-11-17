import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  EmptyButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import {
  setBulkActionType,
  setBulkDeleteFilter,
  setBulkDeleteKeyCount,
  setBulkDeleteSearch,
} from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType, FeatureFlags } from 'uiSrc/constants'
import { SubscriptionsIcon } from 'uiSrc/components/base/icons'
import { FeatureFlagComponent } from 'uiSrc/components'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { Row } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
}
const Actions = ({ handleAddKeyPanel, handleBulkActionsPanel }: Props) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)
  const { viewType, search, filter } = useAppSelector(keysSelector)
  const openAddKeyPanel = () => {
    handleAddKeyPanel(true)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_BUTTON_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const AddKeyBtn = (
    <SecondaryButton
      inverted
      size="m"
      filled
      onClick={openAddKeyPanel}
      data-testid="btn-add-key"
    >
      {t('browser.actions.addKey')}
    </SecondaryButton>
  )
  const openBulkActions = () => {
    // Sync current search/filter to bulk delete state
    dispatch(setBulkDeleteSearch(search))
    dispatch(setBulkDeleteFilter(filter))
    dispatch(setBulkDeleteKeyCount(null))

    dispatch(setBulkActionType(BulkActionsType.Delete))
    handleBulkActionsPanel(true)
  }
  const BulkActionsBtn = (
    <EmptyButton
      color="secondary"
      icon={SubscriptionsIcon}
      onClick={openBulkActions}
      data-testid="btn-bulk-actions"
      aria-label={t('browser.actions.bulkActionsAria')}
    >
      {t('browser.actions.bulkActions')}
    </EmptyButton>
  )
  return (
    <Row
      grow={false}
      gap="m"
      align="center"
      style={{
        flexShrink: 0,
        marginLeft: 12,
      }}
    >
      <FeatureFlagComponent name={FeatureFlags.envDependent}>
        {BulkActionsBtn}
      </FeatureFlagComponent>
      {AddKeyBtn}
    </Row>
  )
}

export default Actions
