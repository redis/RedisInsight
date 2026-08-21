import React, { useEffect } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import {
  agentMemoryConfigurationSelector,
  fetchConfigurationAction,
} from 'uiSrc/slices/agentMemory/workspace'

import * as S from './ConfigurationPanel.styles'

export interface ConfigurationPanelProps {
  endpointId: string
}

const NOT_AVAILABLE = '—'

interface ConfigRowProps {
  label: string
  value?: string
  testId: string
}

const ConfigRow = ({ label, value, testId }: ConfigRowProps) => (
  <S.ConfigRow data-testid={testId}>
    <S.ConfigLabel>{label}</S.ConfigLabel>
    <S.ConfigValue $empty={!value}>{value || NOT_AVAILABLE}</S.ConfigValue>
  </S.ConfigRow>
)

/**
 * Configuration tab - shows the store's General Settings (service name,
 * store id, database, endpoint). Fields the backend doesn't expose render
 * as an em dash.
 */
const ConfigurationPanel = ({ endpointId }: ConfigurationPanelProps) => {
  const { data } = useAppSelector(agentMemoryConfigurationSelector)

  useEffect(() => {
    dispatch(fetchConfigurationAction(endpointId))
  }, [endpointId])

  return (
    <S.Container data-testid="agent-memory-configuration-panel">
      <S.Section>
        <S.SectionTitle>General Settings</S.SectionTitle>
        <ConfigRow
          label="Service Name"
          value={data?.serviceName}
          testId="config-service-name"
        />
        <ConfigRow
          label="Store ID"
          value={data?.storeId}
          testId="config-store-id"
        />
        <ConfigRow
          label="Database"
          value={data?.database}
          testId="config-database"
        />
        <ConfigRow
          label="Endpoint"
          value={data?.endpoint}
          testId="config-endpoint"
        />
      </S.Section>
    </S.Container>
  )
}

export default ConfigurationPanel
