import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import SubscribeInformation from './SubscribeInformation'

describe('SubscribeInformation', () => {
  it('should render', () => {
    expect(render(<SubscribeInformation />)).toBeTruthy()
  })

  it('should open popover on click', async () => {
    render(<SubscribeInformation />)

    fireEvent.click(screen.getByTestId('append-info-icon'))
    expect(screen.getByTestId('pub-sub-examples')).toBeInTheDocument()
  })
})
