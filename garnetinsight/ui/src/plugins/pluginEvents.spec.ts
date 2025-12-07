import { fireEvent } from 'uiSrc/utils/test-utils'
import { pluginApi } from 'uiSrc/services/PluginAPI'
import { listenPluginsEvents, PluginEvents } from './pluginEvents'

jest.mock('uiSrc/services/PluginAPI', () => ({
  pluginApi: {
    sendEvent: jest.fn(),
  },
}))

const createEvent = (data = {}): [string, MessageEventInit] => [
  'message',
  { data: { iframeId: 'id', ...data } },
]

describe('listenPluginsEvents', () => {
  it('should call proper options', () => {
    const sendEventMock = jest.fn()

    ;(pluginApi.sendEvent as jest.Mock).mockImplementation(sendEventMock)

    listenPluginsEvents()

    fireEvent(
      window,
      new MessageEvent(...createEvent({ event: PluginEvents.loaded })),
    )
    expect(sendEventMock).toBeCalledWith('id', PluginEvents.loaded)
    sendEventMock.mockRestore()

    fireEvent(
      window,
      new MessageEvent(
        ...createEvent({ event: PluginEvents.error, error: 'Some error' }),
      ),
    )
    expect(sendEventMock).toBeCalledWith('id', PluginEvents.error, 'Some error')
    sendEventMock.mockRestore()

    fireEvent(
      window,
      new MessageEvent(
        ...createEvent({ event: PluginEvents.heightChanged, height: 100 }),
      ),
    )
    expect(sendEventMock).toBeCalledWith('id', PluginEvents.heightChanged, 100)
    sendEventMock.mockRestore()

    fireEvent(
      window,
      new MessageEvent(
        ...createEvent({
          event: PluginEvents.executeRedisCommand,
          command: 'c',
          requestId: 1,
        }),
      ),
    )
    expect(sendEventMock).toBeCalledWith(
      'id',
      PluginEvents.executeRedisCommand,
      { command: 'c', requestId: 1 },
    )
    sendEventMock.mockRestore()

    fireEvent(
      window,
      new MessageEvent(
        ...createEvent({ event: PluginEvents.setHeaderText, text: 'text' }),
      ),
    )
    expect(sendEventMock).toBeCalledWith(
      'id',
      PluginEvents.setHeaderText,
      'text',
    )
    sendEventMock.mockRestore()

    fireEvent(
      window,
      new MessageEvent(
        ...createEvent({ event: PluginEvents.getState, requestId: 'id' }),
      ),
    )
    expect(sendEventMock).toBeCalledWith('id', PluginEvents.getState, {
      requestId: 'id',
    })
    sendEventMock.mockRestore()

    fireEvent(
      window,
      new MessageEvent(
        ...createEvent({
          event: PluginEvents.setState,
          requestId: 'id',
          state: {},
        }),
      ),
    )
    expect(sendEventMock).toBeCalledWith('id', PluginEvents.setState, {
      requestId: 'id',
      state: {},
    })
    sendEventMock.mockRestore()

    fireEvent(window, new MessageEvent(...createEvent({ event: 'click' })))
  })
})
