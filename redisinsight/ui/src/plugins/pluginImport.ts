/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable no-restricted-globals */
// @ts-nocheck
export const importPluginScript = () => () => {
  // Stringified into inline script source, so keep angle brackets out of this
  // function: a literal `<` before `script` or `!--` truncates the document.
  const configElement = document.getElementById(
    'ri-plugin-config',
  ) as HTMLScriptElement | null
  const {
    scriptSrc,
    scriptPath,
    stylesSrc,
    iframeId,
    modules,
    baseUrl,
    appVersion,
  } = JSON.parse(configElement?.textContent || '{}')
  const events = {
    ERROR: 'error',
    LOADED: 'loaded',
    EXECUTE_COMMAND: 'executeCommand',
    SET_HEADER_TEXT: 'setHeaderText',
    EXECUTE_REDIS_COMMAND: 'executeRedisCommand',
    GET_STATE: 'getState',
    SET_STATE: 'setState',
    FORMAT_REDIS_REPLY: 'formatRedisReply',
  }

  Object.defineProperty(globalThis, 'state', {
    value: {
      callbacks: { counter: 0 },
      pluginState: {},
      config: {
        scriptSrc,
        scriptPath,
        stylesSrc,
        iframeId,
        baseUrl,
        appVersion,
      },
      modules,
    },
    writable: false,
  })

  const { callbacks } = globalThis.state

  const sendMessageToMain = (data = {}) => {
    const event = document.createEvent('Event')
    event.initEvent('message', false, false)
    event.data = data
    event.origin = '*'
    parent.dispatchEvent(event)
  }

  const providePluginSDK = () => {
    globalThis.PluginSDK = {
      setPluginLoadSucceed: () => {
        sendMessageToMain({
          event: events.LOADED,
          iframeId,
        })
      },
      setPluginLoadFailed: (error) => {
        sendMessageToMain({
          event: events.ERROR,
          iframeId,
          error,
        })
      },
    }
  }

  const listenEvents = () => {
    const promiseEvents = [
      events.EXECUTE_REDIS_COMMAND,
      events.GET_STATE,
      events.SET_STATE,
      events.FORMAT_REDIS_REPLY,
    ]
    globalThis.onmessage = (e) => {
      // eslint-disable-next-line sonarjs/no-collapsible-if
      if (e.data.event === events.EXECUTE_COMMAND) {
        const { plugin } = globalThis
        // eslint-disable-next-line no-prototype-builtins
        if (!plugin.hasOwnProperty(e.data.method)) {
          return
        }
        const action = plugin[e.data.method]
        if (typeof action === 'function') {
          action(e.data.data)
        }
      }

      // eslint-disable-next-line sonarjs/no-collapsible-if
      if (promiseEvents.includes(e.data.event)) {
        // eslint-disable-next-line no-prototype-builtins
        if (callbacks.hasOwnProperty(e.data.requestId)) {
          const actions = callbacks[e.data.requestId]
          // eslint-disable-next-line no-prototype-builtins
          if (actions && actions.hasOwnProperty(e.data.actionType)) {
            const action = actions[e.data.actionType]
            if (typeof action === 'function') {
              action(e.data.data)
            }
            delete callbacks[e.data.requestId]
          }
        }
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      sendMessageToMain({
        event: 'heightChanged',
        iframeId,
        height: document.body.offsetHeight,
      })
    })

    resizeObserver.observe(document.body)

    document.addEventListener('click', () => {
      sendMessageToMain({
        event: 'click',
        iframeId,
      })
    })
  }

  providePluginSDK()
  listenEvents()
}

export const PLUGIN_CONFIG_ELEMENT_ID = 'ri-plugin-config'

/** Escape a value for use inside a double-quoted HTML attribute. */
export const escapeHtmlAttribute = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Serialize the plugin config for a JSON script element.
 *
 * A script element is HTML raw text, and every exit from the script-data state
 * begins with `<`, so escaping `<` unconditionally covers the closing tag, the
 * comment opener and a nested start tag alike — do not narrow it to one of
 * those. Lossless, since `JSON.stringify` emits `<` only inside string values.
 */
export const serializeConfigForJsonScript = (config: unknown): string =>
  (JSON.stringify(config ?? {}) ?? '{}').replace(/</g, '\\u003c')

export const prepareIframeHtml = (config) => {
  const importPluginScriptInner: string = importPluginScript().toString()
  const { scriptSrc, stylesSrc, bodyClass } = config
  const stylesLinks = stylesSrc
    .map(
      (styleSrc: string) =>
        `<link rel="stylesheet" href="${escapeHtmlAttribute(styleSrc)}" />`,
    )
    .join('')
  const configJson = serializeConfigForJsonScript(config)

  return `
      <head>
        ${stylesLinks}
        <!-- Forbid XMLHttpRequest (AJAX), WebSocket, fetch(), <a ping> or EventSource -->
        <meta http-equiv="Content-Security-Policy" content="connect-src 'none';">
      </head>
      <body class="${escapeHtmlAttribute(bodyClass)}" style="height: fit-content">
        <script>
          try {
            document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          } catch {
            document.createElementNS = window.parent.document.createElementNS
          }
        </script>
        <div id="app"></div>
        <script type="application/json" id="${PLUGIN_CONFIG_ELEMENT_ID}">${configJson}</script>
        <script>
          globalThis.plugin = {}
          ;(${importPluginScriptInner})();
          var riConfig = globalThis.state.config;
          import(riConfig.scriptSrc)
              .then((module) => {
                  globalThis.plugin = { ...module.default };
                  globalThis.PluginSDK.setPluginLoadSucceed();
              })
              .catch((e) => {
                  var error = riConfig.scriptPath +
                      ' not found. Check if it has been renamed or deleted and try again.'
                  globalThis.PluginSDK.setPluginLoadFailed(error)
              })
        </script>
        <script src="${escapeHtmlAttribute(scriptSrc)}" type="module"></script>
      </body>
`
}
