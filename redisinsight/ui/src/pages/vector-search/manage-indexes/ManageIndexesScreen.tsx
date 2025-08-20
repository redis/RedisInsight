import React from 'react'

import { Title } from 'uiSrc/components/base/text'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

import { useTelemetryMountEvent } from '../hooks/useTelemetryMountEvent'
import {
  VectorSearchScreenFooter,
  VectorSearchScreenHeader,
  VectorSearchScreenWrapper,
} from '../styles'
import { ManageIndexesList } from './ManageIndexesList'

export type ManageIndexesScreenProps = {
  onClose: () => void
}

export const ManageIndexesScreen = ({ onClose }: ManageIndexesScreenProps) => {
  useTelemetryMountEvent(
    TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
    TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
  )

  return (
    <VectorSearchScreenWrapper
      direction="column"
      data-testid="manage-indexes-screen"
    >
      <VectorSearchScreenHeader padding={6}>
        <Title size="S" data-testid="title">
          Manage indexes
        </Title>
        <IconButton
          size="XS"
          icon={CancelSlimIcon}
          aria-label="Close"
          data-testid={'close-saved-queries-btn'}
          onClick={() => onClose()}
        />
      </VectorSearchScreenHeader>
      <VectorSearchScreenFooter
        data-testid="manage-indexes-screen-body"
        grow={1}
        padding={6}
      >
        <ManageIndexesList />
      </VectorSearchScreenFooter>
    </VectorSearchScreenWrapper>
  )
}
