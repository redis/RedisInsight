import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import { streamSelector } from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { Props, StreamDetails } from './StreamDetails'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/stream', () => ({
  ...jest.requireActual('uiSrc/slices/browser/stream'),
  streamSelector: jest.fn().mockReturnValue({
    viewType: 'Data',
  }),
}))

describe('StreamDetails', () => {
  it('should render', () => {
    expect(render(<StreamDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('"add-key-value-items-btn" should render', () => {
    const { queryByTestId } = render(
      <StreamDetails {...instance(mockedProps)} />,
    )
    expect(queryByTestId('add-key-value-items-btn')).toBeInTheDocument()
  })

  it('"add-stream-field-panel" should render', () => {
    const { container, queryByTestId } = render(
      <StreamDetails
        {...instance(mockedProps)}
        onOpenAddItemPanel={() => {}}
      />,
    )

    fireEvent.click(queryByTestId('add-key-value-items-btn')!)
    expect(
      container.querySelector('[data-test-subj="add-stream-field-panel"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-test-subj="add-stream-groups-field-panel"]',
      ),
    ).not.toBeInTheDocument()
  })
  it('"add-stream-groups-field-panel" should render', () => {
    const streamSelectorMock = jest.fn().mockReturnValue({
      viewType: StreamViewType.Groups,
    })
    ;(streamSelector as jest.Mock).mockImplementation(streamSelectorMock)

    const { container, queryByTestId } = render(
      <StreamDetails
        {...instance(mockedProps)}
        onOpenAddItemPanel={() => {}}
      />,
    )

    fireEvent.click(queryByTestId('add-key-value-items-btn')!)
    expect(
      container.querySelector('[data-test-subj="add-stream-field-panel"]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-test-subj="add-stream-groups-field-panel"]',
      ),
    ).toBeInTheDocument()
  })
})
