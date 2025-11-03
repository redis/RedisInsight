import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import Monitor, { Props } from './Monitor'

const mockedProps = mock<Props>()
let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Monitor', () => {
  it('should render', () => {
    expect(render(<Monitor {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Monitor should be in the Document', () => {
    render(<Monitor {...instance(mockedProps)} />)

    const monitor = screen.queryByTestId('monitor')

    expect(monitor).toBeInTheDocument()
  })

  it('Default text component should be in the Document by default', () => {
    render(<Monitor {...instance(mockedProps)} items={[]} />)

    const monitorDefault = screen.queryByTestId('monitor-not-started')

    expect(monitorDefault).toBeInTheDocument()
  })

  it('Default text component should not be in the Document when some items exists', () => {
    const items = [
      {
        time: '1',
        args: ['test'],
        source: '1',
        database: 0,
        shardOptions: { host: '127.0.0.1', port: 6379 },
      },
    ]
    const { queryByTestId, unmount } = render(
      <Monitor {...instance(mockedProps)} isStarted isRunning items={items} />,
    )

    const monitorDefault = queryByTestId('monitor-not-started')

    expect(monitorDefault).not.toBeInTheDocument()
    unmount()
  })

  it('Monitor should start after click on the start button', () => {
    const handleRunMonitorMock = jest.fn()
    render(
      <Monitor
        {...instance(mockedProps)}
        handleRunMonitor={handleRunMonitorMock}
      />,
    )

    fireEvent.click(screen.getByTestId('start-monitor') ?? {})

    expect(handleRunMonitorMock).toBeCalled()
  })

  it('should show warning banner', () => {
    render(<Monitor {...instance(mockedProps)} />)
    expect(screen.getByTestId('monitor-warning-message')).toBeInTheDocument()
  })
})
