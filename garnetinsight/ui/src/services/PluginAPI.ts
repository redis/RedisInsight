class PluginAPIService {
  private subscriptions: any = {}

  onEvent(iframeId = '', event = '', callback: any) {
    this.subscriptions[iframeId] = {
      ...this.subscriptions[iframeId],
      [event]: callback,
    }
  }

  sendEvent(iframeId = '', event = '', data?: any) {
    this.subscriptions[iframeId]?.[event]?.(data)
  }

  unregisterSubscriptions() {
    this.subscriptions = {}
  }
}

const pluginApi = new PluginAPIService()

export { pluginApi }
