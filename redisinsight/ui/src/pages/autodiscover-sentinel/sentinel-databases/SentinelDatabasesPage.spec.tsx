import React from 'react'
import { RiTable } from 'uiBase/layout'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import SentinelDatabasesPage from './SentinelDatabasesPage'
import SentinelDatabases from './components'
import { Props as SentinelDatabasesProps } from './components/SentinelDatabases/SentinelDatabases'

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

jest.mock('./components', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockSentinelDatabases = (props: SentinelDatabasesProps) => (
  <div>
    <button
      type="button"
      onClick={() => props.onClose()}
      data-testid="close-btn"
    >
      onClose
    </button>
    <button type="button" onClick={() => props.onBack()} data-testid="back-btn">
      onBack
    </button>
    <button
      type="button"
      onClick={() => props.onSubmit([])}
      data-testid="submit-btn"
    >
      onSubmit
    </button>
    <RiTable columns={props.columns} data={props.masters} />
  </div>
)

/**
 * SentinelDatabasesPage tests
 *
 * @group component
 */
describe('SentinelDatabasesPage', () => {
  beforeAll(() => {
    SentinelDatabases.mockImplementation(mockSentinelDatabases)
  })
  it('should render', () => {
    expect(render(<SentinelDatabasesPage />)).toBeTruthy()
  })

  it('should call onClose', () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.click(screen.getByTestId('close-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onBack', () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.click(screen.getByTestId('back-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onSubmit', () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.click(screen.getByTestId('submit-btn'))
    expect(component).toBeTruthy()
  })

  it('should be ability to change database alias', () => {
    const component = render(<SentinelDatabasesPage />)
    fireEvent.change(screen.getByPlaceholderText(/Enter Database Alias/i))
    expect(component).toBeTruthy()
  })
})
