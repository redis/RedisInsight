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
import { addKeyIntoList } from 'uiSrc/slices/browser/keys'
import { stringToBuffer } from 'uiSrc/utils'
import { Environment } from 'apiClient'
import {
  bulkActionOverviewFactory,
  bulkActionSummaryOverviewFactory,
} from 'uiSrc/mocks/factories/browser/bulkActions/bulkActionOverview.factory'
import AddKeyArray from './AddKeyArray'
import { Props } from './AddKeyArray.types'
import { DEFAULT_SAMPLE_DATASET, SAMPLE_DATASETS } from './LoadSampleDataset'

const defaultProps: Props = {
  keyName: 'myArray',
  keyTTL: undefined,
  onCancel: jest.fn(),
}

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  addKeyIntoList: jest.fn(() => ({ type: 'keys/addKeyIntoList' })),
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

const selectSampleMode = () =>
  fireEvent.click(screen.getByTestId('add-key-array-populate-sample'))
const selectManualMode = () =>
  fireEvent.click(screen.getByTestId('add-key-array-populate-manual'))
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

  it('should keep the manual side as a placeholder with a disabled submit button', () => {
    renderComponent({ keyName: 'name' })

    expect(screen.getByTestId('add-key-array-placeholder')).toBeInTheDocument()
    expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()
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
        screen.queryByTestId('add-key-array-placeholder'),
      ).not.toBeInTheDocument()
      expect(setKeyName).toHaveBeenLastCalledWith(
        DEFAULT_SAMPLE_DATASET.keyName,
      )
      expect(setKeyNameDisabled).toHaveBeenLastCalledWith(true)

      selectManualMode()
      expect(
        screen.getByTestId('add-key-array-placeholder'),
      ).toBeInTheDocument()
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
