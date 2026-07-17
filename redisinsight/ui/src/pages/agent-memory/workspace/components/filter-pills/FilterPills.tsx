import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { defaultValueRender } from 'uiSrc/components/base/forms/select/RiSelect'
import { connectedAgentMemoryEndpointSelector } from 'uiSrc/slices/agentMemory/endpoints'
import {
  agentMemoryFiltersSelector,
  changeScopeAction,
  setSessionId,
} from 'uiSrc/slices/agentMemory/workspace'
import { AgentMemoryBackendType } from 'uiSrc/slices/interfaces/agentMemory'

import * as S from './FilterPills.styles'

export interface FilterPillsProps {
  endpointId: string
}

const NO_FILTER_LABEL = '(none)'
// Radix Select forbids empty-string item values (reserved for clearing the
// selection), so "(none)" is a sentinel that maps to a null filter.
const NO_FILTER_VALUE = '__no_filter__'

const toOptions = (values: string[]) => [
  { value: NO_FILTER_VALUE, label: NO_FILTER_LABEL },
  ...values.map((value) => ({ value, label: value })),
]

const fromPick = (value: string) => (value === NO_FILTER_VALUE ? null : value)

/**
 * Namespace / user / session pickers. The pickers are linked: changing
 * namespace or user re-lists sessions (session listing depends on both)
 * and auto-picks the most recent one.
 */
const FilterPills = ({ endpointId }: FilterPillsProps) => {
  const { users, namespaces, sessions, userId, namespace, sessionId } =
    useAppSelector(agentMemoryFiltersSelector)
  const { capabilities, backendType } = useAppSelector(
    connectedAgentMemoryEndpointSelector,
  )

  // Cloud's records carry ownerId - "user" is OSS terminology.
  const userLabel =
    backendType === AgentMemoryBackendType.Cloud ? 'owner' : 'user'

  const handleNamespaceChange = (value: string) => {
    dispatch(changeScopeAction(endpointId, { namespace: fromPick(value) }))
  }

  const handleUserChange = (value: string) => {
    dispatch(changeScopeAction(endpointId, { userId: fromPick(value) }))
  }

  return (
    <Row align="center" gap="l" grow={false}>
      {capabilities?.namespaces && (
        <Row align="center" gap="s" grow={false}>
          <Text size="m" color="secondary">
            namespace
          </Text>
          <S.ScopeSelect
            aria-label="namespace"
            data-testid="agent-memory-namespace-select"
            options={toOptions(namespaces)}
            value={namespace ?? NO_FILTER_VALUE}
            valueRender={defaultValueRender}
            onChange={handleNamespaceChange}
          />
        </Row>
      )}
      <Row align="center" gap="s" grow={false}>
        <Text size="m" color="secondary">
          {userLabel}
        </Text>
        <S.ScopeSelect
          aria-label={userLabel}
          data-testid="agent-memory-user-select"
          options={toOptions(users)}
          value={userId ?? NO_FILTER_VALUE}
          valueRender={defaultValueRender}
          onChange={handleUserChange}
        />
      </Row>
      <Row align="center" gap="s" grow={false}>
        <Text size="m" color="secondary">
          session
        </Text>
        <S.ScopeSelect
          data-testid="agent-memory-session-select"
          options={toOptions(sessions)}
          value={sessionId ?? NO_FILTER_VALUE}
          valueRender={defaultValueRender}
          onChange={(value) => dispatch(setSessionId(fromPick(value)))}
        />
      </Row>
    </Row>
  )
}

export default FilterPills
