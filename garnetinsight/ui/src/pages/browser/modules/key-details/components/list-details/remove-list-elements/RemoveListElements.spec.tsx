import React from 'react'
import { instance, mock } from 'ts-mockito'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'

import { Props, RemoveListElements } from './RemoveListElements'
import { HEAD_DESTINATION } from '../add-list-elements/AddListElements'

const COUNT_INPUT = 'count-input'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/instances/instances', () => ({
  connectedInstanceOverviewSelector: jest.fn().mockReturnValue({
    version: '6.2.1',
  }),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'id1',
  }),
}))

describe('RemoveListElements', () => {
  it('should render', () => {
    expect(
      render(<RemoveListElements {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should set count input properly', () => {
    render(<RemoveListElements {...instance(mockedProps)} />)
    const countInput = screen.getByTestId(COUNT_INPUT)
    fireEvent.change(countInput, { target: { value: '123' } })
    expect(countInput).toHaveValue('123')
  })

  it('should set destination properly', () => {
    render(<RemoveListElements {...instance(mockedProps)} />)
    const destinationSelect = screen.getByTestId('destination-select')
    fireEvent.change(destinationSelect, {
      target: { value: HEAD_DESTINATION },
    })
    expect(destinationSelect).toHaveValue(HEAD_DESTINATION)
  })

  it('should show remove popover', () => {
    render(<RemoveListElements {...instance(mockedProps)} />)
    const countInput = screen.getByTestId(COUNT_INPUT)
    fireEvent.change(countInput, { target: { value: '123' } })
    fireEvent.click(screen.getByTestId('remove-elements-btn'))
    expect(screen.getByTestId('remove-submit')).toBeInTheDocument()
  })

  it('should be disabled count with database redis version < 6.2', () => {
    connectedInstanceOverviewSelector.mockImplementation(() => ({
      version: '5.1',
    }))

    render(<RemoveListElements {...instance(mockedProps)} />)
    const countInput = screen.getByTestId(COUNT_INPUT)
    fireEvent.change(countInput, { target: { value: '123' } })
    expect(countInput).toBeDisabled()
  })

  it('should be info box with database redis version < 6.2', () => {
    connectedInstanceOverviewSelector.mockImplementation(() => ({
      version: '5.1',
    }))

    render(<RemoveListElements {...instance(mockedProps)} />)
    expect(screen.getByTestId('info-tooltip-icon')).toBeInTheDocument()
  })
})
