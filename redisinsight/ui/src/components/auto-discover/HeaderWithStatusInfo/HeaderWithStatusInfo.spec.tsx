import React from 'react'
import { fireEvent, screen, act } from '@testing-library/react'
import { render, waitForRiTooltipVisible } from 'uiSrc/utils/test-utils'
import {
  HeaderWithStatusInfo,
  HeaderWithStatusInfoProps,
} from './HeaderWithStatusInfo'

const mockDescriptions: Record<string, string> = {
  Active: 'Resource is active and available.',
  Pending: 'Resource is being provisioned.',
  Failed: 'Resource provisioning failed.',
}

describe('HeaderWithStatusInfo', () => {
  const defaultProps: HeaderWithStatusInfoProps = {
    title: 'Status',
    descriptions: mockDescriptions,
  }

  const renderComponent = (
    propsOverride?: Partial<HeaderWithStatusInfoProps>,
  ) => render(<HeaderWithStatusInfo {...defaultProps} {...propsOverride} />)

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render the title', () => {
    renderComponent()

    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('should render the info icon', () => {
    renderComponent()

    expect(screen.getByTestId('status-info-icon')).toBeInTheDocument()
  })

  it('should show tooltip with all status descriptions on focus', async () => {
    renderComponent()

    await act(async () => {
      fireEvent.focus(screen.getByTestId('status-info-icon'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getAllByText('Active:')[0]).toBeInTheDocument()
    expect(
      screen.getAllByText('Resource is active and available.')[0],
    ).toBeInTheDocument()
    expect(screen.getAllByText('Pending:')[0]).toBeInTheDocument()
    expect(
      screen.getAllByText('Resource is being provisioned.')[0],
    ).toBeInTheDocument()
    expect(screen.getAllByText('Failed:')[0]).toBeInTheDocument()
    expect(
      screen.getAllByText('Resource provisioning failed.')[0],
    ).toBeInTheDocument()
  })

  it('should render with custom title', () => {
    renderComponent({ title: 'State' })

    expect(screen.getByText('State')).toBeInTheDocument()
    expect(screen.getByTestId('state-info-icon')).toBeInTheDocument()
  })

  it('should render with empty descriptions', async () => {
    renderComponent({ descriptions: {} })

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByTestId('status-info-icon')).toBeInTheDocument()

    await act(async () => {
      fireEvent.focus(screen.getByTestId('status-info-icon'))
    })
    await waitForRiTooltipVisible()

    // Tooltip should be visible but empty
    expect(screen.queryByText('Active:')).not.toBeInTheDocument()
  })
})
