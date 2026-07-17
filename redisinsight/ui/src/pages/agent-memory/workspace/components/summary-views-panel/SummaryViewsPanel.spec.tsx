import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import {
  createDefaultSummaryViewsAction,
  deleteSummaryViewAction,
  runSummaryPartitionAction,
  runSummaryViewAction,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  SummaryView,
  SummaryViewPartition,
} from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { formatDateTime, shortId } from '../../utils/format'
import SummaryViewsPanel, { SummaryViewsPanelProps } from './SummaryViewsPanel'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  fetchSummariesAction: jest.fn(() => ({ type: 'FETCH_SUMMARIES' })),
  runSummaryPartitionAction: jest.fn(() => ({ type: 'RUN_SUMMARY' })),
  runSummaryViewAction: jest.fn(() => ({ type: 'RUN_VIEW' })),
  createDefaultSummaryViewsAction: jest.fn(() => ({
    type: 'CREATE_DEFAULT_VIEWS',
  })),
  deleteSummaryViewAction: jest.fn(() => ({ type: 'DELETE_VIEW' })),
}))

const mockedUserView: SummaryView = {
  id: 'view-user',
  name: 'redisinsight:user-profile',
  groupBy: ['user_id'],
}
const mockedSessionView: SummaryView = {
  id: 'view-session',
  name: 'redisinsight:session-profile',
  groupBy: ['session_id'],
  continuous: true,
}
const mockedViews = [mockedUserView, mockedSessionView]

const buildPartition = (
  group: Record<string, string>,
  overrides: Partial<SummaryViewPartition> = {},
): SummaryViewPartition => ({
  summary: faker.lorem.paragraph(),
  group,
  memory_count: faker.number.int({ min: 1, max: 20 }),
  computed_at: faker.date.recent().toISOString(),
  ...overrides,
})

interface StateOverrides {
  views?: SummaryView[] | null
  partitions?: Record<string, SummaryViewPartition[]>
  loading?: boolean
  runningViewIds?: string[]
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState

  state.agentMemory.workspace.summary = {
    loading: overrides.loading ?? false,
    views: overrides.views === undefined ? mockedViews : overrides.views,
    partitions: overrides.partitions ?? {},
    runningViewIds: overrides.runningViewIds ?? [],
    lastRefreshTime: null,
  }

  return mockStore(state)
}

describe('SummaryViewsPanel', () => {
  const defaultProps: SummaryViewsPanelProps = {
    endpointId: faker.string.uuid(),
  }

  const renderComponent = (
    propsOverride?: Partial<SummaryViewsPanelProps>,
    stateOverrides: StateOverrides = {},
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    const store = createStore(stateOverrides)

    return { store, ...render(<SummaryViewsPanel {...props} />, { store }) }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render nothing when views have not been fetched', () => {
    renderComponent(undefined, { views: null })

    expect(screen.queryByTestId('summary-views-panel')).toBeNull()
  })

  it('should render empty state that creates the default views', () => {
    const { store } = renderComponent(undefined, { views: [] })

    expect(screen.getByTestId('summary-views-empty')).toHaveTextContent(
      'No summary views configured.',
    )

    fireEvent.click(screen.getByTestId('summary-views-create-defaults'))

    expect(createDefaultSummaryViewsAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
    )
    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'CREATE_DEFAULT_VIEWS' }]),
    )
  })

  it('should offer the create-defaults button in the header when a default grouping is missing', () => {
    renderComponent(undefined, { views: [mockedUserView] })

    fireEvent.click(screen.getByTestId('summary-views-create-defaults'))

    expect(createDefaultSummaryViewsAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
    )
  })

  it('should not offer the create-defaults button when both default groupings exist', () => {
    renderComponent(undefined, { views: mockedViews })

    expect(
      screen.queryByTestId('summary-views-create-defaults'),
    ).not.toBeInTheDocument()
  })

  it('should offer the full view recompute only while the view has no partitions', () => {
    renderComponent(undefined, {
      partitions: {
        [mockedSessionView.id]: [buildPartition({ session_id: 'sess-1' })],
      },
    })

    expect(
      screen.queryByTestId('summary-view-view-session-run'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('summary-view-view-user-run'))

    expect(runSummaryViewAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
      mockedUserView.id,
    )
  })

  it('should disable the full view recompute while the view run is in flight', () => {
    renderComponent(undefined, {
      runningViewIds: [mockedUserView.id],
    })

    expect(screen.getByTestId('summary-view-view-user-run')).toBeDisabled()
  })

  it('should title every section by its group_by keys', () => {
    const customView: SummaryView = {
      id: 'view-custom',
      name: 'my custom view',
      groupBy: ['topic'],
    }
    renderComponent(undefined, { views: [...mockedViews, customView] })

    expect(screen.getByTestId('summary-view-view-user')).toHaveTextContent(
      'By User ID',
    )
    expect(screen.getByTestId('summary-view-view-session')).toHaveTextContent(
      'By Session ID',
    )
    expect(screen.getByTestId('summary-view-view-custom')).toHaveTextContent(
      'By Topic',
    )
    expect(screen.getByTestId('summary-view-view-custom')).toHaveTextContent(
      'my custom view',
    )
  })

  it('should render the view-name badge and summary count in the section header', () => {
    renderComponent(undefined, {
      partitions: {
        [mockedSessionView.id]: [
          buildPartition({ session_id: 'sess-1' }),
          buildPartition({ session_id: 'sess-2' }),
        ],
      },
    })

    const userHeader = screen.getByTestId('summary-view-view-user')
    const sessionHeader = screen.getByTestId('summary-view-view-session')

    expect(userHeader).toHaveTextContent('redisinsight:user-profile')
    expect(userHeader).toHaveTextContent('0 summaries')
    expect(sessionHeader).toHaveTextContent('redisinsight:session-profile')
    expect(sessionHeader).toHaveTextContent('2 summaries')
  })

  it('should collapse a section and hide its cards when the toggle is clicked', () => {
    renderComponent(undefined, {
      partitions: {
        [mockedSessionView.id]: [buildPartition({ session_id: 'sess-1' })],
      },
    })

    const section = screen.getByTestId('summary-view-view-session')
    const toggle = screen.getByTestId('summary-view-view-session-toggle')

    expect(section.tagName).toEqual('DETAILS')
    expect(toggle.tagName).toEqual('SUMMARY')
    expect(section).toHaveAttribute('open')
    expect(
      screen.getByTestId('summary-view-session-sess-1'),
    ).toBeInTheDocument()

    fireEvent.click(toggle)

    expect(section).not.toHaveAttribute('open')
  })

  it('should render partition cards sorted newest-first', () => {
    renderComponent(undefined, {
      partitions: {
        [mockedSessionView.id]: [
          buildPartition(
            { session_id: 'sess-old' },
            { computed_at: '2026-01-01T00:00:00.000Z' },
          ),
          buildPartition(
            { session_id: 'sess-new' },
            { computed_at: '2026-06-01T00:00:00.000Z' },
          ),
        ],
      },
    })

    const cards = screen.getAllByTestId(/^summary-view-session-sess-(old|new)$/)

    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveAttribute(
      'data-testid',
      'summary-view-session-sess-new',
    )
    expect(cards[1]).toHaveAttribute(
      'data-testid',
      'summary-view-session-sess-old',
    )
  })

  it('should render the card with the group id in the footer and the computed date in the header', () => {
    const partition = buildPartition({ user_id: 'default-user' })
    renderComponent(undefined, {
      partitions: { [mockedUserView.id]: [partition] },
    })

    const card = screen.getByTestId('summary-view-user-default-user')
    const groupId = screen.getByTestId(
      'summary-view-user-default-user-group-id',
    )
    const computedAt = screen.getByTestId(
      'summary-view-user-default-user-computed-at',
    )

    expect(card).toHaveTextContent(partition.summary!)
    expect(groupId.tagName).toEqual('CODE')
    expect(groupId).toHaveTextContent('default-user')
    expect(computedAt.tagName).toEqual('TIME')
    expect(computedAt).toHaveTextContent(formatDateTime(partition.computed_at))
    expect(card).not.toHaveTextContent(shortId(mockedUserView.id))
  })

  it('should dispatch runSummaryPartitionAction for a card recompute', () => {
    const partition = buildPartition({ session_id: 'sess-1' })
    const { store } = renderComponent(undefined, {
      partitions: { [mockedSessionView.id]: [partition] },
    })

    fireEvent.click(screen.getByTestId('summary-view-session-sess-1-refresh'))

    expect(runSummaryPartitionAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
      mockedSessionView.id,
      partition.group,
    )
    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'RUN_SUMMARY' }]),
    )
  })

  it('should disable recompute controls while summaries are loading', () => {
    renderComponent(undefined, {
      partitions: {
        [mockedSessionView.id]: [buildPartition({ session_id: 'sess-1' })],
      },
      loading: true,
    })

    expect(
      screen.getByTestId('summary-view-session-sess-1-refresh'),
    ).toBeDisabled()
  })

  it('should dispatch deleteSummaryViewAction when delete is confirmed', async () => {
    const { store } = renderComponent()

    fireEvent.click(screen.getByTestId('summary-view-view-user-delete-icon'))
    fireEvent.click(await screen.findByTestId('summary-view-view-user-delete'))

    expect(deleteSummaryViewAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
      mockedUserView.id,
    )
    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'DELETE_VIEW' }]),
    )
  })

  it('should render empty state for a view without partitions', () => {
    renderComponent(undefined, { partitions: {} })

    expect(
      screen.getByTestId('summary-view-view-user-empty'),
    ).toHaveTextContent('No summaries yet.')
  })
})
