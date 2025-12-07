import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import SentinelDatabasesPage from './SentinelDatabasesPage'

jest.mock('uiSrc/slices/instances/sentinel', () => ({
  sentinelSelector: jest.fn().mockReturnValue({
    data: [
      {
        status: 'success',
        name: 'mymaster',
        host: 'localhost',
        port: 6379,
        alias: 'alias',
        numberOfSlaves: 0,
      },
    ],
  }),
  createMastersSentinelAction: () => jest.fn(),
  resetLoadedSentinel: () => jest.fn,
  updateMastersSentinel: () => jest.fn(),
  resetDataSentinel: jest.fn,
}))

/**
 * SentinelDatabasesPage tests
 *
 * @group component
 */
describe('SentinelDatabasesPage', () => {
  it('should render', () => {
    expect(render(<SentinelDatabasesPage />)).toBeTruthy()
  })

  it('should call onClose', async () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.click(screen.getByTestId('btn-cancel'))
    fireEvent.click(screen.getByTestId('btn-cancel-proceed'))
    expect(component).toBeTruthy()
  })

  it('should call onBack', () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.click(screen.getByTestId('btn-back-adding'))
    expect(component).toBeTruthy()
  })

  it('should call onSubmit', () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.click(screen.getByTestId('btn-add-primary-group'))
    expect(component).toBeTruthy()
  })

  it('should be ability to change database alias', () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.change(screen.getByPlaceholderText(/Enter Database Alias/i))
    expect(component).toBeTruthy()
  })
})
