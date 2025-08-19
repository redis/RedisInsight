import React from 'react'

import { Title } from 'uiSrc/components/base/text'
import { TelemetryEvent } from 'uiSrc/telemetry'

import { useTelemetryMountEvent } from '../hooks/useTelemetryMountEvent'
import {
  VectorSearchScreenFooter,
  VectorSearchScreenHeader,
  VectorSearchScreenWrapper,
} from '../styles'
import { ManageIndexesList } from './ManageIndexesList'

export const ManageIndexesScreen = () => {
  useTelemetryMountEvent(
    TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
    TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
  )

  return (
    <VectorSearchScreenWrapper
      direction="column"
      data-testid="manage-indexes-screen"
    >
      <VectorSearchScreenHeader>
        <Title size="M" data-testid="title">
          Manage indexes
        </Title>
      </VectorSearchScreenHeader>
      <VectorSearchScreenFooter
        data-testid="manage-indexes-screen-body"
        grow={1}
      >
        <ManageIndexesList />
      </VectorSearchScreenFooter>
    </VectorSearchScreenWrapper>
  )
}
