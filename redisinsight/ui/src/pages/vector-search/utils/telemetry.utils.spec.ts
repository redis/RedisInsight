import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { IndexField } from '../components/index-details/IndexDetails.types'
import {
  getFieldTypeSummary,
  getSearchCommandType,
  searchResultsTelemetry,
} from './telemetry.utils'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('getFieldTypeSummary', () => {
  it('should return empty object for empty fields', () => {
    const result = getFieldTypeSummary([])
    expect(result).toEqual({})
  })

  it('should count field types correctly', () => {
    const fields: IndexField[] = [
      { id: '1', name: 'title', value: 'title', type: FieldTypes.TEXT },
      { id: '2', name: 'tag', value: 'tag', type: FieldTypes.TAG },
      { id: '3', name: 'desc', value: 'desc', type: FieldTypes.TEXT },
      { id: '4', name: 'vec', value: 'vec', type: FieldTypes.VECTOR },
      { id: '5', name: 'tag2', value: 'tag2', type: FieldTypes.TAG },
    ]

    const result = getFieldTypeSummary(fields)
    expect(result).toEqual({
      [FieldTypes.TEXT]: 2,
      [FieldTypes.TAG]: 2,
      [FieldTypes.VECTOR]: 1,
    })
  })

  it('should handle single field type', () => {
    const fields: IndexField[] = [
      { id: '1', name: 'vec', value: 'vec', type: FieldTypes.VECTOR },
    ]

    const result = getFieldTypeSummary(fields)
    expect(result).toEqual({ [FieldTypes.VECTOR]: 1 })
  })
})

describe('getSearchCommandType', () => {
  it.each([
    { input: 'FT.SEARCH idx *', expected: 'search' },
    { input: 'FT.AGGREGATE idx *', expected: 'aggregate' },
    { input: 'FT.EXPLAIN idx "*" LIMIT 0 10', expected: 'explain' },
    { input: 'FT.PROFILE idx SEARCH QUERY "*"', expected: 'profile' },
    { input: 'FT.INFO idx', expected: 'other' },
    { input: 'SET key value', expected: 'other' },
    { input: '', expected: 'other' },
  ])('should return "$expected" for "$input"', ({ input, expected }) => {
    expect(getSearchCommandType(input)).toBe(expected)
  })
})

describe('searchResultsTelemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send SEARCH_COMMAND_COPIED event on onCommandCopied', () => {
    searchResultsTelemetry.onCommandCopied?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_COPIED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_CLEAR_RESULT_CLICKED event on onResultCleared', () => {
    searchResultsTelemetry.onResultCleared?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_CLEAR_RESULT_CLICKED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULTS_COLLAPSED event on onResultCollapsed', () => {
    searchResultsTelemetry.onResultCollapsed?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_COLLAPSED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULTS_EXPANDED event on onResultExpanded', () => {
    searchResultsTelemetry.onResultExpanded?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_EXPANDED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULT_VIEW_CHANGED event on onResultViewChanged', () => {
    const params = {
      databaseId: 'db-123',
      command: 'FT.SEARCH',
      rawMode: false,
      group: false,
      previousView: 'Text',
      currentView: 'Plugin',
    }

    searchResultsTelemetry.onResultViewChanged?.(params)

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULT_VIEW_CHANGED,
      eventData: params,
    })
  })

  it('should send SEARCH_RESULTS_IN_FULL_SCREEN event on onFullScreenToggled', () => {
    searchResultsTelemetry.onFullScreenToggled?.({
      state: 'Open',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
      eventData: { databaseId: 'db-123', state: 'Open' },
    })
  })

  it('should send SEARCH_COMMAND_RUN_AGAIN event on onQueryReRun', () => {
    searchResultsTelemetry.onQueryReRun?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
      eventData: { databaseId: 'db-123', commands: ['FT.SEARCH idx query'] },
    })
  })
})
