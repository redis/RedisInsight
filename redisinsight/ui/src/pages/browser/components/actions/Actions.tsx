import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import styles from 'uiSrc/pages/browser/components/browser-search-panel/styles.module.scss'
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
    <PrimaryButton
      onClick={openAddKeyPanel}
      className={styles.addKey}
      data-testid="btn-add-key"
    >
      + <span className={styles.addKeyText}>Key</span>
    </PrimaryButton>
  )
  const openBulkActions = () => {
    dispatch(setBulkActionType(BulkActionsType.Delete))
    handleBulkActionsPanel(true)
  }
  const BulkActionsBtn = (
    <SecondaryButton
      color="secondary"
      icon={SubscriptionsIcon}
      onClick={openBulkActions}
      data-testid="btn-bulk-actions"
      aria-label="bulk actions"
      iconSize="small"
    >
      Bulk Actions
    </SecondaryButton>
  )
  return (
    <Row
      grow={false}
      gap="m"
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
