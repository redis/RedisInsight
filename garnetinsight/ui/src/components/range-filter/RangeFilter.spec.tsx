import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import RangeFilter, { Props } from './RangeFilter'

const mockedProps = mock<Props>()

const startRangeTestId = 'range-start-input'
const endRangeTestId = 'range-end-input'
const resetBtnTestId = 'range-filter-btn'

describe('RangeFilter', () => {
  it('should render', () => {
    expect(render(<RangeFilter {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call handleChangeStart onChange start range thumb', () => {
    const handleChangeStart = jest.fn()
    render(
      <RangeFilter
        {...instance(mockedProps)}
        handleChangeStart={handleChangeStart}
        start={1}
        end={1000}
      />,
    )
    const startRangeInput = screen.getByTestId(startRangeTestId)

    fireEvent.mouseUp(startRangeInput, { target: { value: 123 } })
    expect(handleChangeStart).toBeCalledTimes(1)
  })

  it('should call handleChangeEnd onChange end range thumb', () => {
    const handleChangeEnd = jest.fn()
    render(
      <RangeFilter
        {...instance(mockedProps)}
        handleChangeEnd={handleChangeEnd}
        start={1}
        end={100}
      />,
    )
    const endRangeInput = screen.getByTestId(endRangeTestId)

    fireEvent.mouseUp(endRangeInput, { target: { value: 15 } })
    expect(handleChangeEnd).toBeCalledTimes(1)
  })
  it('should call handleResetFilter onClick reset button', () => {
    const handleResetFilter = jest.fn()

    render(
      <RangeFilter
        {...instance(mockedProps)}
        handleResetFilter={handleResetFilter}
        start={1}
        end={100}
        min={1}
        max={120}
      />,
    )
    const resetBtn = screen.getByTestId(resetBtnTestId)

    fireEvent.click(resetBtn)

    expect(handleResetFilter).toBeCalledTimes(1)
  })
})
