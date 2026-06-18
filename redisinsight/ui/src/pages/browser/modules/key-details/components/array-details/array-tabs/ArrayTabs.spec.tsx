import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import ArrayTabs from './ArrayTabs'
import { ArrayTabsProps } from './ArrayTabs.types'
import { ARRAY_DETAILS_TAB_LABELS, ArrayDetailsTab } from '../constants'

describe('ArrayTabs', () => {
  const defaultProps: ArrayTabsProps = {
    value: ArrayDetailsTab.View,
    onChange: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<ArrayTabsProps>) =>
    render(<ArrayTabs {...defaultProps} {...propsOverride} />)

  it('renders View, Aggregate and Search tabs with the active one selected', () => {
    renderComponent()

    expect(screen.getByTestId('array-tabs')).toBeInTheDocument()

    Object.values(ArrayDetailsTab).forEach((tab) => {
      expect(
        screen.getByText(ARRAY_DETAILS_TAB_LABELS[tab]),
      ).toBeInTheDocument()
    })
  })

  it('calls onChange with the picked tab id', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.mouseDown(screen.getByText(ARRAY_DETAILS_TAB_LABELS.aggregate))

    expect(onChange).toHaveBeenCalledWith(ArrayDetailsTab.Aggregate)
  })
})
