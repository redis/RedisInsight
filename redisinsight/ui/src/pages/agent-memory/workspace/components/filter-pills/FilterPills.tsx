import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { defaultValueRender } from 'uiSrc/components/base/forms/select/RiSelect'
import {
  agentMemoryFiltersSelector,
  changeScopeAction,
  setSessionId,
} from 'uiSrc/slices/agentMemory/workspace'

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
 * Owner / session pickers. Changing the owner re-lists sessions (session
 * listing depends on it) and auto-picks the most recent one.
 */
const FilterPills = ({ endpointId }: FilterPillsProps) => {
  const { users, sessions, userId, sessionId } = useAppSelector(
    agentMemoryFiltersSelector,
  )

  // Records carry an ownerId; label the picker "owner".
  const userLabel = 'owner'

  const handleUserChange = (value: string) => {
    dispatch(changeScopeAction(endpointId, { userId: fromPick(value) }))
  }

  return (
    <Row align="center" gap="l" grow={false}>
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
