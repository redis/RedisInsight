import { pluginApi } from 'uiSrc/services/PluginAPI'

describe('PluginApi', () => {
  it('should subscribe on event and receive data after emit', () => {
    const mockCallback = jest.fn()
    const data = { data: 'some data' }

    pluginApi.onEvent('id1', 'someEvent', mockCallback)
    pluginApi.sendEvent('id1', 'someEvent', data)

    expect(mockCallback).toBeCalledWith(data)
  })

  it('should subscribe on event and not receive data after unregister all subscriptions and emit', () => {
    const mockCallback = jest.fn()
    const data = { data: 'some data' }

    pluginApi.onEvent('id1', 'someEvent', mockCallback)
    pluginApi.unregisterSubscriptions()
    pluginApi.sendEvent('id1', 'someEvent', data)

    expect(mockCallback).not.toBeCalled()
  })
})
