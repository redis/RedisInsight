import React from 'react'
import { RiTable } from 'uiBase/layout'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import RedisCloudDatabasesPage from './RedisCloudDatabasesPage'
import RedisCloudDatabases from './RedisCloudDatabases'
import { Props as RedisCloudDatabasesProps } from './RedisCloudDatabases/RedisCloudDatabases'

jest.mock('./RedisCloudDatabases', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockRedisCloudDatabases = (props: RedisCloudDatabasesProps) => (
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
    <div className="itemList">
      <RiTable
        columns={props.columns}
        data={[]}
        defaultSorting={[{ id: 'name', desc: false }]}
      />
    </div>
  </div>
)

/**
 * RedisCloudDatabasesPage tests
 *
 * @group component
 */
describe('RedisCloudDatabasesPage', () => {
  beforeAll(() => {
    RedisCloudDatabases.mockImplementation(mockRedisCloudDatabases)
  })

  it('should render', () => {
    expect(render(<RedisCloudDatabasesPage />)).toBeTruthy()
  })

  it('should call onClose', () => {
    const component = render(<RedisCloudDatabasesPage />)
    fireEvent.click(screen.getByTestId('close-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onBack', () => {
    const component = render(<RedisCloudDatabasesPage />)
    fireEvent.click(screen.getByTestId('back-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onSubmit', () => {
    const component = render(<RedisCloudDatabasesPage />)
    fireEvent.click(screen.getByTestId('submit-btn'))
    expect(component).toBeTruthy()
  })
})
