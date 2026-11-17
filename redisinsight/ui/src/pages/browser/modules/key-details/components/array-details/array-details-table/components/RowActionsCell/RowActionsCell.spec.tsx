import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { KeyValueFormat } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { getConfig } from 'uiSrc/config'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'

import { RowActionsCell } from './RowActionsCell'
import {
  ArrayElementDeleteConfig,
  ArrayElementEditConfig,
} from './RowActionsCell.types'

const { truncatedStringPrefix } = getConfig().app

const SUFFIX = '-array-element'

const buildConfig = (
  over: Partial<ArrayElementDeleteConfig> = {},
): ArrayElementDeleteConfig => ({
  deleting: '',
  suffix: SUFFIX,
  hideEmptySlots: true,
  closePopover: jest.fn(),
  showPopover: jest.fn(),
  handleDeleteElement: jest.fn(),
  ...over,
})

const buildEditConfig = (
  over: Partial<ArrayElementEditConfig> = {},
): ArrayElementEditConfig => ({
  compressor: null,
  viewFormat: KeyValueFormat.Unicode,
  editingIndex: null,
  isValueDrawerOpen: false,
  updating: false,
  loading: false,
  onEditElement: jest.fn(),
  onOpenValueEditor: jest.fn(),
  ...over,
})

describe('RowActionsCell', () => {
  it('shows a delete trigger for a populated row and opens the popover on click', () => {
    const showPopover = jest.fn()
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        deleteConfig={buildConfig({ showPopover })}
      />,
    )

    fireEvent.click(screen.getByTestId('array-remove-btn-5-icon'))
    expect(showPopover).toHaveBeenCalledWith('5')
  })

  it('fires handleDeleteElement with the row index on confirm', () => {
    const handleDeleteElement = jest.fn()
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        deleteConfig={buildConfig({
          deleting: `5${SUFFIX}`,
          handleDeleteElement,
        })}
      />,
    )

    fireEvent.click(screen.getByTestId('array-remove-btn-5'))
    expect(handleDeleteElement).toHaveBeenCalledWith('5')
  })

  it('renders nothing for an empty-slot row when hideEmptySlots is set (View gaps)', () => {
    const { container } = render(
      <RowActionsCell
        element={arrayElementFactory.build({ index: '3' })}
        deleteConfig={buildConfig({ hideEmptySlots: true })}
      />,
    )

    expect(
      container.querySelector('[data-testid^="array-remove-btn"]'),
    ).toBeNull()
  })

  it('still renders delete for a null-value row when hideEmptySlots is false (Search WITHVALUES off)', () => {
    render(
      <RowActionsCell
        element={arrayElementFactory.build({ index: '3' })}
        deleteConfig={buildConfig({ hideEmptySlots: false })}
      />,
    )

    expect(screen.getByTestId('array-remove-btn-3-icon')).toBeInTheDocument()
  })
})

describe('RowActionsCell — edit + expand', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders edit and expand triggers for a populated editable row', () => {
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig()}
        deleteConfig={buildConfig()}
      />,
    )

    expect(screen.getByTestId('array-edit-btn-5')).toBeInTheDocument()
    expect(screen.getByTestId('array-expand-btn-5')).toBeInTheDocument()
  })

  it('opens inline edit via onEditElement when the pencil is clicked', () => {
    const onEditElement = jest.fn()
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({ onEditElement })}
      />,
    )

    fireEvent.click(screen.getByTestId('array-edit-btn-5'))
    expect(onEditElement).toHaveBeenCalledWith('5', true)
  })

  it('opens the value drawer via onOpenValueEditor when expand is clicked', () => {
    const onOpenValueEditor = jest.fn()
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({ onOpenValueEditor })}
      />,
    )

    fireEvent.click(screen.getByTestId('array-expand-btn-5'))
    expect(onOpenValueEditor).toHaveBeenCalledWith('5')
  })

  it('warns before inline edit when a non-Unicode format is selected', () => {
    const onEditElement = jest.fn()
    const state = cloneDeep(mockedStore.getState())
    state.browser.keys.selectedKey.viewFormat = KeyValueFormat.JSON
    const jsonStore = mockStore(state)

    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({
          viewFormat: KeyValueFormat.JSON,
          onEditElement,
        })}
      />,
      { store: jsonStore },
    )

    fireEvent.click(screen.getByTestId('array-edit-btn-5'))

    expect(onEditElement).not.toHaveBeenCalled()
    expect(
      screen.getByTestId('non-unicode-edit-to-unicode'),
    ).toBeInTheDocument()
  })

  it('hides edit, expand and delete while this row is being edited', () => {
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({ editingIndex: '5' })}
        deleteConfig={buildConfig()}
      />,
    )

    expect(screen.queryByTestId('array-edit-btn-5')).not.toBeInTheDocument()
    expect(screen.queryByTestId('array-expand-btn-5')).not.toBeInTheDocument()
    // Delete is hidden too: deleting this row would race its pending ARSET.
    expect(
      screen.queryByTestId('array-remove-btn-5-icon'),
    ).not.toBeInTheDocument()
  })

  it('keeps delete for other rows while a different row is inline-edited', () => {
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({ editingIndex: '7' })}
        deleteConfig={buildConfig()}
      />,
    )

    // Only the edited row's delete is frozen; ARDEL leaves a gap without
    // shifting indexes, so deleting a different row can't race the edit.
    expect(screen.getByTestId('array-remove-btn-5-icon')).toBeInTheDocument()
  })

  it('hides delete while an ARSET is in flight, even on a non-edited row', () => {
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({ editingIndex: null, updating: true })}
        deleteConfig={buildConfig()}
      />,
    )

    // Inline Save closes the editor before its write settles, so `updating`
    // covers the window where a delete would race the pending ARSET.
    expect(
      screen.queryByTestId('array-remove-btn-5-icon'),
    ).not.toBeInTheDocument()
  })

  it('hides all row actions (edit, expand, delete) while the drawer is open', () => {
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({ isValueDrawerOpen: true })}
        deleteConfig={buildConfig()}
      />,
    )

    // Freezing deletes too: deleting the edited element would let a later
    // drawer Save resurrect it via ARSET.
    expect(screen.queryByTestId('array-edit-btn-5')).not.toBeInTheDocument()
    expect(screen.queryByTestId('array-expand-btn-5')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('array-remove-btn-5-icon'),
    ).not.toBeInTheDocument()
  })

  it('stops trigger clicks from bubbling to a row click handler', () => {
    const onRowClick = jest.fn()
    render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onClick={onRowClick}>
        <RowActionsCell
          element={arrayElementWithValueFactory.build({ index: '5' })}
          editConfig={buildEditConfig()}
        />
      </div>,
    )

    fireEvent.click(screen.getByTestId('array-expand-btn-5'))
    fireEvent.click(screen.getByTestId('array-edit-btn-5'))

    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('disables edit and expand while a write is in flight', () => {
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        editConfig={buildEditConfig({ updating: true })}
      />,
    )

    expect(screen.getByTestId('array-edit-btn-5')).toBeDisabled()
    expect(screen.getByTestId('array-expand-btn-5')).toBeDisabled()
  })

  it('disables edit and expand for a backend-truncated value', () => {
    const element = arrayElementWithValueFactory.build({ index: '5' })
    element.value = stringToBuffer(
      `${truncatedStringPrefix} big value…`,
    ) as typeof element.value
    render(<RowActionsCell element={element} editConfig={buildEditConfig()} />)

    expect(screen.getByTestId('array-edit-btn-5')).toBeDisabled()
    expect(screen.getByTestId('array-expand-btn-5')).toBeDisabled()
  })

  it('renders no edit or expand triggers when editConfig is omitted (read-only)', () => {
    render(
      <RowActionsCell
        element={arrayElementWithValueFactory.build({ index: '5' })}
        deleteConfig={buildConfig()}
      />,
    )

    expect(screen.queryByTestId('array-edit-btn-5')).not.toBeInTheDocument()
    expect(screen.queryByTestId('array-expand-btn-5')).not.toBeInTheDocument()
    expect(screen.getByTestId('array-remove-btn-5-icon')).toBeInTheDocument()
  })

  it('renders no edit or expand triggers for a null-value Search row but keeps delete', () => {
    render(
      <RowActionsCell
        element={arrayElementFactory.build({ index: '3' })}
        editConfig={buildEditConfig()}
        deleteConfig={buildConfig({ hideEmptySlots: false })}
      />,
    )

    expect(screen.queryByTestId('array-edit-btn-3')).not.toBeInTheDocument()
    expect(screen.queryByTestId('array-expand-btn-3')).not.toBeInTheDocument()
    expect(screen.getByTestId('array-remove-btn-3-icon')).toBeInTheDocument()
  })
})
