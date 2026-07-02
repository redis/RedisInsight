import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'

import { RowActionsCell } from './RowActionsCell'
import { ArrayElementDeleteConfig } from './RowActionsCell.types'

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
