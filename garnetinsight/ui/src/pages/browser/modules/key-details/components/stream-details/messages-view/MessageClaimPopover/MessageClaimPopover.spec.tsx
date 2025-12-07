import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  selectedConsumerSelector,
  selectedGroupSelector,
} from 'uiSrc/slices/browser/stream'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { MOCK_TRUNCATED_BUFFER_VALUE } from 'uiSrc/mocks/data/bigString'
import MessageClaimPopover, { Props } from './MessageClaimPopover'

const mockConsumers = [
  { name: stringToBuffer('Consumer 1') },
  { name: stringToBuffer('Consumer 2') },
  { name: MOCK_TRUNCATED_BUFFER_VALUE },
]

jest.mock('uiSrc/slices/browser/stream', () => ({
  ...jest.requireActual('uiSrc/slices/browser/stream'),
  selectedGroupSelector: jest.fn(),
  selectedConsumerSelector: jest.fn(),
}))

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(selectedGroupSelector as jest.Mock).mockReturnValue({
    data: [mockConsumers[0], mockConsumers[1]],
  })
  ;(selectedConsumerSelector as jest.Mock).mockReturnValue(mockConsumers[0])
})

describe('MessageClaimPopover', () => {
  it('should render', () => {
    expect(
      render(<MessageClaimPopover {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
  it('should not disable button when there are consumers to claim', async () => {
    render(<MessageClaimPopover {...instance(mockedProps)} />)

    const [claimButton] = screen.getAllByTestId(/claim-pending-message$/)
    expect(claimButton).toBeEnabled()
  })
  it('should disable button when there are no other consumers to claim', () => {
    ;(selectedGroupSelector as jest.Mock).mockReturnValueOnce({
      data: [mockConsumers[0]],
    })

    render(<MessageClaimPopover {...instance(mockedProps)} />)

    const [claimButton] = screen.getAllByTestId(/claim-pending-message$/)
    expect(claimButton).toBeDisabled()
  })
  it('should disable button when there are truncated consumers only', () => {
    ;(selectedGroupSelector as jest.Mock).mockReturnValueOnce({
      data: [mockConsumers[0], mockConsumers[2]],
    })

    render(<MessageClaimPopover {...instance(mockedProps)} />)

    const [claimButton] = screen.getAllByTestId(/claim-pending-message$/)
    expect(claimButton).toBeDisabled()
  })
})
