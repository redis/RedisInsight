import React from 'react'

import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import FilterDropdown, { FilterDropdownProps } from './FilterDropdown'

const TEST_ID = 'ltm-filter-topics'
const mockedOptions = ['alpha', 'beta', 'gamma']

describe('FilterDropdown', () => {
  const defaultProps: FilterDropdownProps = {
    label: 'topics',
    options: mockedOptions,
    selected: [],
    onToggle: jest.fn(),
    'data-testid': TEST_ID,
  }

  const renderComponent = (propsOverride?: Partial<FilterDropdownProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<FilterDropdown {...props} />)
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render the plain label when nothing is selected', () => {
    renderComponent()

    expect(screen.getByTestId(TEST_ID)).toHaveTextContent('topics ▾')
  })

  it('should render the selection count in the button label', () => {
    renderComponent({ selected: [mockedOptions[0], mockedOptions[2]] })

    expect(screen.getByTestId(TEST_ID)).toHaveTextContent('topics (2) ▾')
  })

  it('should open the popover with one checkbox per option', async () => {
    renderComponent()

    fireEvent.click(screen.getByTestId(TEST_ID))

    expect(
      await screen.findByTestId(`${TEST_ID}-option-${mockedOptions[0]}`),
    ).toBeInTheDocument()
    mockedOptions.forEach((option) => {
      expect(
        screen.getByTestId(`${TEST_ID}-option-${option}`),
      ).toBeInTheDocument()
    })
  })

  it('should mark selected options as checked', async () => {
    renderComponent({ selected: [mockedOptions[1]] })

    fireEvent.click(screen.getByTestId(TEST_ID))

    expect(
      await screen.findByTestId(`${TEST_ID}-option-${mockedOptions[1]}`),
    ).toBeChecked()
    expect(
      screen.getByTestId(`${TEST_ID}-option-${mockedOptions[0]}`),
    ).not.toBeChecked()
  })

  it('should call onToggle with the option value when it is clicked', async () => {
    const onToggle = jest.fn()
    renderComponent({ onToggle })

    fireEvent.click(screen.getByTestId(TEST_ID))
    fireEvent.click(
      await screen.findByTestId(`${TEST_ID}-option-${mockedOptions[1]}`),
    )

    expect(onToggle).toHaveBeenCalledWith(mockedOptions[1])
  })

  it('should render the empty text when there are no options', async () => {
    renderComponent({ options: [], emptyText: 'no topics seen yet' })

    fireEvent.click(screen.getByTestId(TEST_ID))

    expect(await screen.findByText('no topics seen yet')).toBeInTheDocument()
  })

  it('should render the default empty text when none is provided', async () => {
    renderComponent({ options: [], emptyText: undefined })

    fireEvent.click(screen.getByTestId(TEST_ID))

    expect(await screen.findByText('no options')).toBeInTheDocument()
  })
})
