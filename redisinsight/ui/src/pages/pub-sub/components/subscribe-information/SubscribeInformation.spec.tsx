import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import SubscribeInformation from './SubscribeInformation'

describe('SubscribeInformation', () => {
  it('should render', () => {
    expect(render(<SubscribeInformation />)).toBeTruthy()
  })

  it('should show tooltip on hover', async () => {
    render(<SubscribeInformation />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('append-info-icon'))
    })
    await waitForRiTooltipVisible()

    expect(
      screen.getAllByText(/Subscribe to one or more channels/)[0],
    ).toBeInTheDocument()
  })
})
