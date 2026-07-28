import React from 'react'
import {
  act,
  fireEvent,
  mockedStore,
  render,
  screen,
  userEvent,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { addArrayKey, addKeyIntoList } from 'uiSrc/slices/browser/keys'
import i18n from 'uiSrc/i18n'
import { stringToBuffer } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Environment } from 'apiClient'
import {
  bulkActionOverviewFactory,
  bulkActionSummaryOverviewFactory,
} from 'uiSrc/mocks/factories/browser/bulkActions/bulkActionOverview.factory'
import AddKeyArray from './AddKeyArray'
import { Props } from './AddKeyArray.types'
import {
  CONTIGUOUS_MODE,
  CREATION_MODE_OPTIONS,
  SPARSE_MODE,
} from './constants'
import { DEFAULT_SAMPLE_DATASET, SAMPLE_DATASETS } from './LoadSampleDataset'

const defaultProps: Props = {
  keyName: 'myArray',
  keyTTL: undefined,
  onCancel: jest.fn(),
}

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  addKeyIntoList: jest.fn(() => ({ type: 'keys/addKeyIntoList' })),
  addArrayKey: jest.fn(() => ({ type: 'keys/addArrayKey' })),
}))

// A stable object keeps the memoized selector happy; a fresh one per call
// floods the test output with reselect identity warnings.
const mockConnectedInstance = { id: 'instanceId' }
jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: () => mockConnectedInstance,
}))

const mockLoad = jest.fn()
jest.mock('uiSrc/services/hooks', () => ({
  ...jest.requireActual('uiSrc/services/hooks'),
  useLoadData: () => ({
    load: mockLoad,
    loading: false,
    error: null,
  }),
}))

const mockCheckArrayKeyExists = jest.fn()
const mockApplyKeyTtl = jest.fn()
jest.mock('./LoadSampleDataset', () => ({
  __esModule: true,
  ...jest.requireActual('./LoadSampleDataset'),
  checkArrayKeyExists: (...args: unknown[]) => mockCheckArrayKeyExists(...args),
  applyKeyTtl: (...args: unknown[]) => mockApplyKeyTtl(...args),
}))

const mockUseDatabaseEnvironment = jest.fn()
jest.mock('uiSrc/components/hooks/useDatabaseEnvironment', () => ({
  useDatabaseEnvironment: () => mockUseDatabaseEnvironment(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

// A bulk-import overview that reports a single succeeded command (one
// ARSET/ARMSET) — the success shape the submit flow expects.
const succeededOverview = () =>
  bulkActionOverviewFactory.build({
    summary: bulkActionSummaryOverviewFactory.build({
      processed: 1,
      succeed: 1,
      failed: 0,
    }),
  })

const contiguousDataset = SAMPLE_DATASETS.find(
  ({ collectionName }) => collectionName === 'readme-document',
)!

const valueFindingRegex = /^value-\d+$/

const getModeOptionLabel = (mode: string) =>
  i18n.t(
    (CREATION_MODE_OPTIONS.find(({ value }) => value === mode)?.label ??
      '') as never,
  )

const selectSampleMode = () =>
  fireEvent.click(screen.getByTestId('add-key-array-populate-sample'))
const selectManualMode = () =>
  fireEvent.click(screen.getByTestId('add-key-array-populate-manual'))
const selectSparseMode = async () => {
  await userEvent.click(screen.getByTestId('creation-mode-select'))
  await userEvent.click(
    await screen.findByText(getModeOptionLabel(SPARSE_MODE)),
  )
}
const selectDataset = async (label: string) => {
  await userEvent.click(screen.getByTestId('sample-dataset-select'))
  await userEvent.click(await screen.findByText(label))
}

const expectMessageDispatched = (title: string) =>
  expect(mockedStore.getActions()).toContainEqual(
    expect.objectContaining({
      type: 'notifications/addMessageNotification',
      payload: expect.objectContaining({ title }),
    }),
  )

describe('AddKeyArray', () => {
  const renderComponent = (propsOverride?: Partial<Props>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<AddKeyArray {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedStore.clearActions()
    // Default: the target key does not exist, so submit proceeds to import.
    mockCheckArrayKeyExists.mockResolvedValue(false)
    mockApplyKeyTtl.mockResolvedValue(undefined)
    mockLoad.mockResolvedValue(succeededOverview())
    // Default: non-production database, so the sample load is allowed.
    mockUseDatabaseEnvironment.mockReturnValue({
      environment: Environment.Unspecified,
      isDangerousCommand: () => false,
    })
    // ActionFooter renders via a portal to #formFooterBar
    const footer = document.createElement('div')
    footer.setAttribute('id', 'formFooterBar')
    document.body.appendChild(footer)
  })

  afterEach(() => {
    document.getElementById('formFooterBar')?.remove()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  describe('manual mode', () => {
    it('should render contiguous mode with default start index by default', () => {
      renderComponent()

      expect(
        screen.getByText(getModeOptionLabel(CONTIGUOUS_MODE)),
      ).toBeInTheDocument()
      expect(screen.getByTestId('start-index')).toHaveValue('0')
      expect(screen.getByTestId(valueFindingRegex)).toBeInTheDocument()
      expect(screen.queryByTestId('sparse-index-0')).not.toBeInTheDocument()
    })

    it('should show paired index and value inputs after switching to sparse mode', async () => {
      renderComponent()

      await selectSparseMode()

      expect(screen.getByTestId('sparse-index-0')).toBeInTheDocument()
      expect(screen.getByTestId('sparse-value-0')).toBeInTheDocument()
      expect(screen.queryByTestId('start-index')).not.toBeInTheDocument()
    })

    it('should disable the submit button with empty keyName', () => {
      renderComponent({ keyName: '' })

      expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()
    })

    it('should disable the submit button when the start index is cleared', () => {
      renderComponent({ keyName: 'name' })

      expect(screen.getByTestId('add-key-array-btn')).not.toBeDisabled()

      fireEvent.change(screen.getByTestId('start-index'), {
        target: { value: '' },
      })

      expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()
    })

    it('should disable submit when a contiguous range would exceed the u64 max', () => {
      renderComponent({ keyName: 'name' })

      // ARRAY_INDEX_MAX = 2^64 − 2, the largest valid index.
      fireEvent.change(screen.getByTestId('start-index'), {
        target: { value: '18446744073709551614' },
      })
      // a single value at the max index is still in range
      expect(screen.getByTestId('add-key-array-btn')).not.toBeDisabled()

      // a second value would land one past the u64 range
      fireEvent.click(screen.getByTestId('add-item'))
      expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()
    })

    it('should disable the submit button in sparse mode until every index is filled', async () => {
      renderComponent({ keyName: 'name' })

      await selectSparseMode()

      expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()

      fireEvent.change(screen.getByTestId('sparse-index-0'), {
        target: { value: '5' },
      })

      expect(screen.getByTestId('add-key-array-btn')).not.toBeDisabled()
    })

    it('should dispatch addArrayKey with a canonical start index on contiguous submit', () => {
      renderComponent({ keyName: 'name', onCancel: jest.fn() })

      fireEvent.change(screen.getByTestId('start-index'), {
        target: { value: '007' },
      })
      fireEvent.change(screen.getByTestId('value-0'), {
        target: { value: 'first' },
      })
      fireEvent.click(screen.getByTestId('add-key-array-btn'))

      expect(addArrayKey).toHaveBeenCalledWith(
        {
          keyName: stringToBuffer('name'),
          mode: CONTIGUOUS_MODE,
          startIndex: '7',
          values: [stringToBuffer('first')],
        },
        expect.any(Function),
      )
    })

    it('should dispatch addArrayKey with canonical element indexes on sparse submit', async () => {
      renderComponent({ keyName: 'name', onCancel: jest.fn() })

      await selectSparseMode()

      fireEvent.change(screen.getByTestId('sparse-index-0'), {
        target: { value: '0042' },
      })
      fireEvent.change(screen.getByTestId('sparse-value-0'), {
        target: { value: 'answer' },
      })
      fireEvent.click(screen.getByTestId('add-key-array-btn'))

      expect(addArrayKey).toHaveBeenCalledWith(
        {
          keyName: stringToBuffer('name'),
          mode: SPARSE_MODE,
          elements: [{ index: '42', value: stringToBuffer('answer') }],
        },
        expect.any(Function),
      )
    })

    it('should include expire in payload when keyTTL is provided', () => {
      renderComponent({ keyName: 'name', keyTTL: 60, onCancel: jest.fn() })

      fireEvent.click(screen.getByTestId('add-key-array-btn'))

      expect(addArrayKey).toHaveBeenCalledWith(
        expect.objectContaining({ expire: 60 }),
        expect.any(Function),
      )
    })

    it('should send ARRAY_CREATED with the contiguous mode on a manual submit', () => {
      renderComponent({ keyName: 'name', onCancel: jest.fn() })

      fireEvent.click(screen.getByTestId('add-key-array-btn'))

      // ARRAY_CREATED rides the addArrayKey success callback, which the mocked
      // thunk never invokes, so drive it directly.
      const onSuccess = (addArrayKey as jest.Mock).mock.calls[0][1]
      onSuccess()

      expect(sendEventTelemetry).toHaveBeenCalledTimes(1)
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.ARRAY_CREATED,
        eventData: {
          databaseId: 'instanceId',
          source: 'scratch',
          mode: CONTIGUOUS_MODE,
        },
      })
    })

    it('should send ARRAY_CREATED with the sparse mode on a manual submit', async () => {
      renderComponent({ keyName: 'name', onCancel: jest.fn() })

      await selectSparseMode()
      fireEvent.change(screen.getByTestId('sparse-index-0'), {
        target: { value: '5' },
      })
      fireEvent.click(screen.getByTestId('add-key-array-btn'))

      const onSuccess = (addArrayKey as jest.Mock).mock.calls[0][1]
      onSuccess()

      expect(sendEventTelemetry).toHaveBeenCalledTimes(1)
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.ARRAY_CREATED,
        eventData: {
          databaseId: 'instanceId',
          source: 'scratch',
          mode: SPARSE_MODE,
        },
      })
    })
  })

  describe('sample data mode', () => {
    it('should swap to the dataset loader and lock the parent keyName to the default dataset', () => {
      const setKeyName = jest.fn()
      const setKeyNameDisabled = jest.fn()
      renderComponent({ setKeyName, setKeyNameDisabled })

      // Initial Manual render → input cleared and unlocked.
      expect(setKeyName).toHaveBeenLastCalledWith('')
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(false)

      selectSampleMode()
      expect(
        screen.getByTestId('add-key-array-load-sample-dataset'),
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('creation-mode-select'),
      ).not.toBeInTheDocument()
      expect(setKeyName).toHaveBeenLastCalledWith(
        DEFAULT_SAMPLE_DATASET.keyName,
      )
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(true)

      selectManualMode()
      expect(screen.getByTestId('creation-mode-select')).toBeInTheDocument()
      expect(setKeyName).toHaveBeenLastCalledWith('')
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(false)
    })

    it('should re-lock the parent keyName and update the preview when another dataset is selected', async () => {
      const setKeyName = jest.fn()
      const setKeyNameDisabled = jest.fn()
      renderComponent({ setKeyName, setKeyNameDisabled })

      selectSampleMode()
      await selectDataset(contiguousDataset.label)

      expect(setKeyName).toHaveBeenLastCalledWith(contiguousDataset.keyName)
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(true)
      const info = screen.getByTestId('load-sample-dataset-info')
      expect(info).toHaveTextContent(contiguousDataset.keyName)
    })

    it('should enable the submit button in sample mode even with an empty keyName', () => {
      renderComponent({ keyName: '' })

      expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()

      selectSampleMode()

      expect(screen.getByTestId('add-key-array-btn')).not.toBeDisabled()
    })

    it('should load the selected collection then add the key to the list on submit', async () => {
      const onCancel = jest.fn()
      renderComponent({ onCancel })

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() =>
        expect(mockLoad).toHaveBeenCalledWith(
          expect.anything(),
          DEFAULT_SAMPLE_DATASET.collectionName,
        ),
      )
      expect(addKeyIntoList).toHaveBeenCalledWith(
        expect.objectContaining({
          key: stringToBuffer(DEFAULT_SAMPLE_DATASET.keyName),
        }),
      )
      expectMessageDispatched('Sample array added')
      expect(onCancel).toHaveBeenCalled()
    })

    it('should send both sample telemetry events on a successful submit', async () => {
      renderComponent()

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() =>
        expect(sendEventTelemetry).toHaveBeenCalledWith({
          event: TelemetryEvent.ARRAY_SAMPLE_DATASET_LOADED,
          eventData: {
            databaseId: 'instanceId',
            collectionName: DEFAULT_SAMPLE_DATASET.collectionName,
          },
        }),
      )
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.ARRAY_CREATED,
        eventData: {
          databaseId: 'instanceId',
          source: 'sample_dataset',
        },
      })
      // The dataset-loaded event leads so funnels read load -> created.
      expect(sendEventTelemetry).toHaveBeenCalledTimes(2)
      expect(
        (sendEventTelemetry as jest.Mock).mock.calls.map(
          ([call]) => call.event,
        ),
      ).toEqual([
        TelemetryEvent.ARRAY_SAMPLE_DATASET_LOADED,
        TelemetryEvent.ARRAY_CREATED,
      ])
    })

    it('should send no telemetry when the sample key already exists', async () => {
      mockCheckArrayKeyExists.mockResolvedValue(true)
      renderComponent()

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() => expectMessageDispatched('Key already exists'))
      expect(sendEventTelemetry).not.toHaveBeenCalled()
    })

    it('should send no telemetry when the sample import fails', async () => {
      mockLoad.mockResolvedValue(
        bulkActionOverviewFactory.build({
          summary: bulkActionSummaryOverviewFactory.build({
            processed: 1,
            succeed: 0,
            failed: 1,
          }),
        }),
      )
      renderComponent()

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() => expectMessageDispatched('Failed to create array'))
      expect(sendEventTelemetry).not.toHaveBeenCalled()
    })

    it('should load the selected collection slug after switching datasets', async () => {
      const onCancel = jest.fn()
      renderComponent({ onCancel })

      selectSampleMode()
      await selectDataset(contiguousDataset.label)

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() =>
        expect(mockLoad).toHaveBeenCalledWith(
          expect.anything(),
          contiguousDataset.collectionName,
        ),
      )
      expect(addKeyIntoList).toHaveBeenCalledWith(
        expect.objectContaining({
          key: stringToBuffer(contiguousDataset.keyName),
        }),
      )
    })

    it('should show an info toast and skip the import when the key already exists', async () => {
      mockCheckArrayKeyExists.mockResolvedValue(true)
      const onCancel = jest.fn()
      renderComponent({ onCancel })

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() => expectMessageDispatched('Key already exists'))
      expect(mockLoad).not.toHaveBeenCalled()
      expect(addKeyIntoList).not.toHaveBeenCalled()
      expect(onCancel).toHaveBeenCalled()
    })

    it('should apply the TTL to the created key when one is set', async () => {
      renderComponent({ keyTTL: 3600 })

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() =>
        expect(mockApplyKeyTtl).toHaveBeenCalledWith(
          expect.anything(),
          DEFAULT_SAMPLE_DATASET.keyName,
          3600,
        ),
      )
      expect(addKeyIntoList).toHaveBeenCalled()
    })

    it('should not apply a TTL when none is set', async () => {
      renderComponent()

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() => expect(addKeyIntoList).toHaveBeenCalled())
      expect(mockApplyKeyTtl).not.toHaveBeenCalled()
    })

    it('should show a failure toast and not add the key when the import reports failures', async () => {
      mockLoad.mockResolvedValue(
        bulkActionOverviewFactory.build({
          summary: bulkActionSummaryOverviewFactory.build({
            processed: 1,
            succeed: 0,
            failed: 1,
          }),
        }),
      )
      const onCancel = jest.fn()
      renderComponent({ onCancel })

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() => expectMessageDispatched('Failed to create array'))
      expect(addKeyIntoList).not.toHaveBeenCalled()
      expect(onCancel).not.toHaveBeenCalled()
    })

    it('should dispatch the failure toast and keep the dialog open when load fails', async () => {
      mockLoad.mockRejectedValue(new Error('boom'))
      const onCancel = jest.fn()
      renderComponent({ onCancel })

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      await waitFor(() => expectMessageDispatched('Failed to create array'))
      expect(onCancel).not.toHaveBeenCalled()
    })

    it('should still add the key with a notice when the TTL fails after a successful import', async () => {
      mockApplyKeyTtl.mockRejectedValue(new Error('ttl boom'))
      const onCancel = jest.fn()
      renderComponent({ keyTTL: 3600, onCancel })

      selectSampleMode()

      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      // The key was created, so it is registered and the dialog closes — the
      // partial-success notice (not a failure toast) explains the missing TTL.
      await waitFor(() =>
        expectMessageDispatched('Sample array added without TTL'),
      )
      expect(addKeyIntoList).toHaveBeenCalledWith(
        expect.objectContaining({
          key: stringToBuffer(DEFAULT_SAMPLE_DATASET.keyName),
        }),
      )
      expect(onCancel).toHaveBeenCalled()
    })

    it('should lock the dataset select while a sample import is in flight', async () => {
      let resolveLoad: (overview: unknown) => void = () => {}
      mockLoad.mockReturnValue(
        new Promise((resolve) => {
          resolveLoad = resolve
        }),
      )
      renderComponent()

      selectSampleMode()
      await act(async () => {
        fireEvent.click(screen.getByTestId('add-key-array-btn'))
      })

      expect(screen.getByTestId('sample-dataset-select')).toBeDisabled()

      await act(async () => {
        resolveLoad(succeededOverview())
      })
    })

    describe('on a production database', () => {
      beforeEach(() => {
        mockUseDatabaseEnvironment.mockReturnValue({
          environment: Environment.Production,
          isDangerousCommand: () => true,
        })
      })

      it('should disable the submit button and show a warning', () => {
        renderComponent()

        selectSampleMode()

        expect(
          screen.getByTestId('add-key-array-prod-warning'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()
      })

      it('should not run the bulk import even if submit is triggered', async () => {
        const onCancel = jest.fn()
        renderComponent({ onCancel })

        selectSampleMode()

        await act(async () => {
          fireEvent.click(screen.getByTestId('add-key-array-btn'))
        })

        expect(mockLoad).not.toHaveBeenCalled()
        expect(addKeyIntoList).not.toHaveBeenCalled()
        expect(onCancel).not.toHaveBeenCalled()
      })
    })
  })
})
