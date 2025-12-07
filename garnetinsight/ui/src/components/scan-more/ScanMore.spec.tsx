import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, screen, render } from 'uiSrc/utils/test-utils'
import ScanMore, { Props } from './ScanMore'

const mockedProps = mock<Props>()

describe('ScanMore', () => {
  it('should render', () => {
    expect(render(<ScanMore {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call "loadMoreItems"', () => {
    const handleClick = jest.fn()

    const renderer = render(
      <ScanMore
        {...instance(mockedProps)}
        loadMoreItems={handleClick}
        scanned={1}
        totalItemsCount={2}
      />,
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId('scan-more'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should show button when totalItemsCount < scanned and nextCursor is not zero', () => {
    const { queryByTestId } = render(
      <ScanMore
        {...instance(mockedProps)}
        scanned={2}
        totalItemsCount={1}
        nextCursor="123"
      />,
    )

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should hide button when totalItemsCount < scanned and nextCursor is zero', () => {
    const { queryByTestId } = render(
      <ScanMore
        {...instance(mockedProps)}
        scanned={2}
        totalItemsCount={1}
        nextCursor="0"
      />,
    )

    expect(queryByTestId('scan-more')).not.toBeInTheDocument()
  })
  it('should button be shown when totalItemsCount > scanned ', () => {
    const { queryByTestId } = render(
      <ScanMore {...instance(mockedProps)} scanned={1} totalItemsCount={2} />,
    )

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })
})
