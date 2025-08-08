import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import {
  collectChangedSavedQueryIndexTelemetry,
  collectCreateIndexStepTelemetry,
  collectCreateIndexWizardTelemetry,
  collectIndexInfoStepTelemetry,
  collectInsertSavedQueryTelemetry,
  collectManageIndexesDeleteTelemetry,
  collectManageIndexesDetailsToggleTelemetry,
  collectManageIndexesDrawerClosedTelemetry,
  collectManageIndexesDrawerOpenedTelemetry,
  collectQueryToggleFullScreenTelemetry,
  collectSavedQueriesPanelToggleTelemetry,
  collectStartStepTelemetry,
  collectTelemetryQueryClear,
  collectTelemetryQueryClearAll,
  collectTelemetryQueryReRun,
  collectTelemetryQueryRun,
} from './telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import {
  CreateSearchIndexParameters,
  SampleDataContent,
  SampleDataType,
  SearchIndexType,
} from './create-index/types'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

export const createSearchIndexParametersFactory =
  Factory.define<CreateSearchIndexParameters>(() => ({
    instanceId: 'test-instance',
    searchIndexType: faker.helpers.enumValue(SearchIndexType),
    sampleDataType: faker.helpers.enumValue(SampleDataType),
    dataContent: faker.helpers.enumValue(SampleDataContent),
    usePresetVectorIndex: true,
    indexName: 'BIKES',
    indexFields: [],
  }))

describe('telemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('collectCreateIndexWizardTelemetry', () => {
    it('should collect telemetry for the start step', () => {
      const mockParameters = createSearchIndexParametersFactory.build()
      const instanceId = INSTANCE_ID_MOCK

      collectCreateIndexWizardTelemetry({
        step: 1,
        instanceId,
        parameters: mockParameters,
      })

      // Verify that the telemetry event was sent with the correct parameters
      expect(sendEventTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_TRIGGERED,
        }),
      )
    })

    it('should collect telemetry for the index info step', () => {
      const mockParameters = createSearchIndexParametersFactory.build()
      const instanceId = INSTANCE_ID_MOCK

      collectCreateIndexWizardTelemetry({
        step: 2,
        instanceId,
        parameters: mockParameters,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_INDEX_INFO,
        }),
      )
    })

    it('should collect telemetry for the create index step', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectCreateIndexWizardTelemetry({
        step: 3,
        instanceId,
        parameters: createSearchIndexParametersFactory.build(),
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_QUERIES,
        }),
      )
    })

    it('should not collect telemetry for steps other than 1, 2, or 3', () => {
      const mockParameters = createSearchIndexParametersFactory.build()
      const instanceId = INSTANCE_ID_MOCK

      collectCreateIndexWizardTelemetry({
        step: 4,
        instanceId,
        parameters: mockParameters,
      })

      expect(sendEventTelemetry).not.toHaveBeenCalled()
    })
  })

  describe('collectStartStepTelemetry', () => {
    it('should collect telemetry for the start step', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectStartStepTelemetry(instanceId)

      // Verify that the telemetry event was sent with the correct parameters
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_TRIGGERED,
        eventData: { databaseId: instanceId },
      })
    })
  })

  describe('collectIndexInfoStepTelemetry', () => {
    it('should collect telemetry for the index info step', () => {
      const instanceId = INSTANCE_ID_MOCK
      const mockParameters = createSearchIndexParametersFactory.build()

      collectIndexInfoStepTelemetry(instanceId, mockParameters)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_INDEX_INFO,
        eventData: {
          databaseId: instanceId,
          indexType: mockParameters.searchIndexType,
          sampleDataType: mockParameters.sampleDataType,
          dataContent: mockParameters.dataContent,
        },
      })
    })
  })

  describe('collectCreateIndexStepTelemetry', () => {
    it('should collect telemetry for the create index step', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectCreateIndexStepTelemetry(instanceId)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_QUERIES,
        eventData: { databaseId: instanceId },
      })
    })
  })

  describe('collectSavedQueriesPanelToggleTelemetry', () => {
    it('should collect telemetry for saved queries panel toggle on open', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isSavedQueriesOpen = false

      collectSavedQueriesPanelToggleTelemetry({
        instanceId,
        isSavedQueriesOpen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })

    it('should collect telemetry for saved queries panel toggle on close', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isSavedQueriesOpen = true

      collectSavedQueriesPanelToggleTelemetry({
        instanceId,
        isSavedQueriesOpen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })

  describe('collectChangedSavedQueryIndexTelemetry', () => {
    it('should collect telemetry for changed saved query index', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectChangedSavedQueryIndexTelemetry({ instanceId })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_INDEX_CHANGED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })

  describe('collectInsertSavedQueryTelemetry', () => {
    it('should collect telemetry for insert saved query', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectInsertSavedQueryTelemetry({ instanceId })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_INSERT_CLICKED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })

  describe('collectManageIndexesDrawerOpenedTelemetry', () => {
    it('should collect telemetry for the manage indexes drawer opened', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectManageIndexesDrawerOpenedTelemetry({ instanceId })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
        eventData: { databaseId: instanceId },
      })
    })
  })

  describe('collectManageIndexesDrawerClosedTelemetry', () => {
    it('should collect telemetry for the manage indexes drawer closed', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectManageIndexesDrawerClosedTelemetry({ instanceId })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
        eventData: { databaseId: instanceId },
      })
    })
  })

  describe('collectManageIndexesDetailsToggleTelemetry', () => {
    it('should collect telemetry for the manage indexes details toggle on open', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isOpen = true

      collectManageIndexesDetailsToggleTelemetry({ instanceId, isOpen })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_OPENED,
        eventData: { databaseId: instanceId },
      })
    })

    it('should collect telemetry for the manage indexes details toggle on close', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isOpen = false

      collectManageIndexesDetailsToggleTelemetry({ instanceId, isOpen })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_CLOSED,
        eventData: { databaseId: instanceId },
      })
    })
  })

  describe('collectManageIndexesDeleteTelemetry', () => {
    it('should collect telemetry for the manage indexes delete', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectManageIndexesDeleteTelemetry({ instanceId })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEX_DELETED,
        eventData: { databaseId: instanceId },
      })
    })
  })

  describe('collectTelemetryQueryRun', () => {
    it('should collect telemetry for query run', () => {
      const instanceId = INSTANCE_ID_MOCK
      const query = 'TEST_QUERY'

      collectTelemetryQueryRun({
        instanceId,
        query,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
        eventData: {
          databaseId: instanceId,
          commands: [query],
        },
      })
    })
  })

  describe('collectTelemetryQueryReRun', () => {
    it('should collect telemetry for query re-run', () => {
      const instanceId = INSTANCE_ID_MOCK
      const query = 'TEST_QUERY'

      collectTelemetryQueryReRun({
        instanceId,
        query,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
        eventData: {
          databaseId: instanceId,
          commands: [query],
        },
      })
    })
  })

  describe('collectTelemetryQueryClearAll', () => {
    it('should collect telemetry for clearing all queries', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectTelemetryQueryClearAll({
        instanceId,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })

  describe('collectTelemetryQueryClear', () => {
    it('should collect telemetry for clearing a query', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectTelemetryQueryClear({
        instanceId,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_EDITOR_CLICKED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })

  describe('collectQueryToggleFullScreenTelemetry', () => {
    it('should collect telemetry for opening full screen', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isFullScreen = true

      collectQueryToggleFullScreenTelemetry({
        instanceId,
        isFullScreen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: instanceId,
          state: 'Open',
        },
      })
    })

    it('should collect telemetry for closing full screen', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isFullScreen = false

      collectQueryToggleFullScreenTelemetry({
        instanceId,
        isFullScreen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: instanceId,
          state: 'Close',
        },
      })
    })
  })
})
