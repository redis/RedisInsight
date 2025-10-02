import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  EmptyButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { setBulkActionType } from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType, FeatureFlags } from 'uiSrc/constants'
import { SubscriptionsIcon } from 'uiSrc/components/base/icons'
import { FeatureFlagComponent } from 'uiSrc/components'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { Row } from 'uiSrc/components/base/layout/flex'

export interface Props {
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
}
const Actions = ({ handleAddKeyPanel, handleBulkActionsPanel }: Props) => {
  const dispatch = useDispatch()
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)
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
      size="m"
      inverted
      onClick={openAddKeyPanel}
      data-testid="btn-add-key"
    >
      Add key
    </SecondaryButton>
  )
  const openBulkActions = () => {
    dispatch(setBulkActionType(BulkActionsType.Delete))
    handleBulkActionsPanel(true)
  }
  const BulkActionsBtn = (
    <EmptyButton
      color="secondary"
      icon={SubscriptionsIcon}
      onClick={openBulkActions}
      data-testid="btn-bulk-actions"
      aria-label="bulk actions"
    >
      Bulk actions
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
