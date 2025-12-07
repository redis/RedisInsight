import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import KeysSummary, { Props } from './KeysSummary'

const mockedProps = mock<Props>()

describe('KeysSummary', () => {
  it('should render', () => {
    expect(render(<KeysSummary {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should "Scanning..." be in the document until loading and totalItemsCount == 0 ', () => {
    const { queryByTestId } = render(
      <KeysSummary {...instance(mockedProps)} loading totalItemsCount={0} />,
    )
    expect(queryByTestId('scanning-text')).toBeInTheDocument()
  })

  it('should Keys summary be in the document meanwhile totalItemsCount != 0 ', () => {
    const { queryByTestId } = render(
      <KeysSummary {...instance(mockedProps)} totalItemsCount={2} />,
    )
    expect(queryByTestId('keys-summary')).toBeInTheDocument()
  })

  it('should Keys summary show proper text with count = 1', () => {
    const { queryByTestId } = render(
      <KeysSummary
        {...instance(mockedProps)}
        scanned={1}
        items={[{}]}
        totalItemsCount={1}
      />,
    )
    expect(queryByTestId('keys-summary')).toHaveTextContent('Results: 1.')
  })

  it('should Keys summary show proper text with count > 1', () => {
    const { queryByTestId } = render(
      <KeysSummary
        {...instance(mockedProps)}
        scanned={2}
        items={[{}, {}]}
        totalItemsCount={2}
      />,
    )
    expect(queryByTestId('keys-summary')).toHaveTextContent('Results: 2.')
  })

  it('should not render Scan more button if showScanMore = false ', () => {
    const { queryByTestId } = render(
      <KeysSummary {...instance(mockedProps)} showScanMore={false} />,
    )
    expect(queryByTestId('scan-more')).not.toBeInTheDocument()
  })
})
