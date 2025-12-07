import { pluginApi } from 'uiSrc/services/PluginAPI'

const dispatchBodyEvent = (mouseEventType: string) => {
  document.querySelector('body')?.dispatchEvent(
    new MouseEvent(mouseEventType, {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
    }),
  )
}

export enum PluginEvents {
  loaded = 'loaded',
  error = 'error',
  heightChanged = 'heightChanged',
  setHeaderText = 'setHeaderText',
  executeRedisCommand = 'executeRedisCommand',
  getState = 'getState',
  setState = 'setState',
  formatRedisReply = 'formatRedisReply',
}

export const listenPluginsEvents = () => {
  globalThis.onmessage = (e: MessageEvent) => {
    switch (e.data?.event) {
      case PluginEvents.loaded: {
        pluginApi.sendEvent(e.data.iframeId, PluginEvents.loaded)
        break
      }
      case PluginEvents.error: {
        pluginApi.sendEvent(e.data.iframeId, PluginEvents.error, e.data.error)
        break
      }
      case PluginEvents.heightChanged: {
        pluginApi.sendEvent(
          e.data.iframeId,
          PluginEvents.heightChanged,
          e.data.height,
        )
        break
      }
      case PluginEvents.executeRedisCommand: {
        pluginApi.sendEvent(e.data.iframeId, PluginEvents.executeRedisCommand, {
          command: e.data.command,
          requestId: e.data.requestId,
        })
        break
      }
      case PluginEvents.setHeaderText: {
        pluginApi.sendEvent(
          e.data.iframeId,
          PluginEvents.setHeaderText,
          e.data.text,
        )
        break
      }
      case PluginEvents.getState: {
        pluginApi.sendEvent(e.data.iframeId, PluginEvents.getState, {
          requestId: e.data.requestId,
        })
        break
      }
      case PluginEvents.setState: {
        pluginApi.sendEvent(e.data.iframeId, PluginEvents.setState, {
          requestId: e.data.requestId,
          state: e.data.state,
        })
        break
      }
      case PluginEvents.formatRedisReply: {
        pluginApi.sendEvent(e.data.iframeId, PluginEvents.formatRedisReply, {
          requestId: e.data.requestId,
          data: e.data.data,
        })
        break
      }
      case 'click': {
        // Simulate bubbling from iframe
        ;['mousedown', 'click', 'mouseup'].forEach(dispatchBodyEvent)
        break
      }
      default:
    }
  }
}
