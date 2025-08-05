import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { v4 as uuidv4 } from 'uuid'
import { pluginApi } from 'uiSrc/services/PluginAPI'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  getBaseApiUrl,
  Nullable,
  formatToText,
  replaceEmptyValue,
} from 'uiSrc/utils'
import { RiLoadingContent, RiFlexItem } from 'uiSrc/components/base/layout'
import { Theme } from 'uiSrc/constants'
import {
  CommandExecutionResult,
  IPluginVisualization,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import { PluginEvents } from 'uiSrc/plugins/pluginEvents'
import { prepareIframeHtml } from 'uiSrc/plugins/pluginImport'
import {
  appPluginsSelector,
  getPluginStateAction,
  sendPluginCommandAction,
  setPluginStateAction,
} from 'uiSrc/slices/app/plugins'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appServerInfoSelector } from 'uiSrc/slices/app/info'

import { RiColorText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

export interface Props {
  result: CommandExecutionResult[]
  query: any
  id: string
  setMessage: (text: string) => void
  commandId: string
  mode?: RunQueryMode
}

enum StylesNamePostfix {
  Dark = '/dark_theme.css',
  Light = '/light_theme.css',
  Global = '/global_styles.css',
}

enum ActionTypes {
  Resolve = 'resolve',
  Reject = 'reject',
}

const baseUrl = getBaseApiUrl()

const QueryCardCliPlugin = (props: Props) => {
  const {
    query,
    id,
    result,
    setMessage,
    commandId,
    mode = RunQueryMode.Raw,
  } = props
  const { visualizations = [], staticPath } = useSelector(appPluginsSelector)
  const { modules = [] } = useSelector(connectedInstanceSelector)
  const serverInfo = useSelector(appServerInfoSelector)

  const [currentView, setCurrentView] = useState<Nullable<any>>(null)
  const [currentPlugin, setCurrentPlugin] = useState<Nullable<string>>(null)
  const [isPluginLoaded, setIsPluginLoaded] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const pluginIframeRef = useRef<Nullable<HTMLIFrameElement>>(null)
  const prevPluginHeightRef = useRef<string>('0')
  const generatedIframeNameRef = useRef<string>('')
  const { theme } = useContext(ThemeContext)

  const dispatch = useDispatch()

  const sendMessageToPlugin = (data = {}) => {
    const event: any = document.createEvent('Event')
    event.initEvent('message', false, false)
    event.data = data
    event.origin = '*'
    pluginIframeRef?.current?.contentWindow?.dispatchEvent(event)
  }

  const executeCommand = (method: string) => {
    sendMessageToPlugin({
      event: 'executeCommand',
      method,
      data: { command: query, data: result, mode },
    })
  }

  const sendRedisCommand = ({
    command = '',
    requestId = '',
  }: {
    command: string
    requestId: string
  }) => {
    const commonOptions = {
      event: PluginEvents.executeRedisCommand,
      requestId,
    }
    dispatch(
      sendPluginCommandAction({
        command,
        onSuccessAction: (response) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Resolve,
            data: response.result,
          })
        },
        onFailAction: (error: any) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Reject,
            data: error,
          })
        },
      }),
    )
  }

  const getPluginState = ({ requestId }: { requestId: string }) => {
    const commonOptions = {
      event: PluginEvents.getState,
      requestId,
    }
    dispatch(
      getPluginStateAction({
        visualizationId: id,
        commandId,
        onSuccessAction: (response) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Resolve,
            data: response?.state ?? null,
          })
        },
        onFailAction: (error: any) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Reject,
            data: error,
          })
        },
      }),
    )
  }

  const setPluginState = ({
    requestId,
    state,
  }: {
    requestId: string
    state: any
  }) => {
    const commonOptions = {
      event: PluginEvents.setState,
      requestId,
    }
    dispatch(
      setPluginStateAction({
        visualizationId: id,
        commandId,
        pluginState: state,
        onSuccessAction: () => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Resolve,
            data: state,
          })
        },
        onFailAction: (error: any) => {
          sendMessageToPlugin({
            ...commonOptions,
            actionType: ActionTypes.Reject,
            data: error,
          })
        },
      }),
    )
  }

  const formatRedisResponse = ({
    requestId,
    data,
  }: {
    requestId: string
    data: { response: any; command: string }
  }) => {
    try {
      const reply = formatToText(
        replaceEmptyValue(data?.response),
        data.command,
      )

      sendMessageToPlugin({
        event: PluginEvents.formatRedisReply,
        requestId,
        actionType: ActionTypes.Resolve,
        data: reply,
      })
    } catch (e) {
      sendMessageToPlugin({
        event: PluginEvents.formatRedisReply,
        requestId,
        actionType: ActionTypes.Reject,
        data: e,
      })
    }
  }

  useEffect(() => {
    if (currentView === null) return
    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.heightChanged,
      (height: string) => {
        if (pluginIframeRef?.current) {
          pluginIframeRef.current.height = height || prevPluginHeightRef.current
          prevPluginHeightRef.current = height
        }
      },
    )

    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.loaded,
      () => {
        setIsPluginLoaded(true)
        setError('')
        executeCommand(currentView.activationMethod)
      },
    )

    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.error,
      (error: string) => {
        setIsPluginLoaded(true)
        setError(error)
      },
    )

    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.setHeaderText,
      (text: string) => {
        setMessage(text)
      },
    )

    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.executeRedisCommand,
      sendRedisCommand,
    )
    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.getState,
      getPluginState,
    )
    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.setState,
      setPluginState,
    )
    pluginApi.onEvent(
      generatedIframeNameRef.current,
      PluginEvents.formatRedisReply,
      formatRedisResponse,
    )
  }, [currentView])

  const renderPluginIframe = (config: any) => {
    const html = prepareIframeHtml({
      ...config,
      bodyClass: theme === Theme.Dark ? 'theme_DARK' : 'theme_LIGHT',
      modules,
    })
    // @ts-ignore
    pluginIframeRef.current.srcdoc = html
  }

  const getGlobalStylesSrc = (): string =>
    `${baseUrl}${staticPath}${StylesNamePostfix.Global}`

  const getThemeSrc = (): string =>
    `${baseUrl}${staticPath}${theme === Theme.Dark ? StylesNamePostfix.Dark : StylesNamePostfix.Light}`

  const generateStylesSrc = (styles: string): string[] => {
    const themeSrc = getThemeSrc()
    const globalSrc = getGlobalStylesSrc()

    return [globalSrc, themeSrc, `${baseUrl}${styles}`]
  }

  useEffect(() => {
    const view = visualizations.find(
      (visualization: IPluginVisualization) => visualization.uniqId === id,
    )
    if (view) {
      generatedIframeNameRef.current = `${view.plugin.name}-${uuidv4()}`
      setCurrentView(view)

      const { plugin } = view
      if (plugin?.name !== currentPlugin) {
        renderPluginIframe({
          baseUrl: `${baseUrl}${plugin.baseUrl}`,
          scriptPath: plugin.scriptSrc,
          scriptSrc: `${baseUrl}${plugin.scriptSrc}`,
          stylesSrc: generateStylesSrc(plugin.stylesSrc),
          iframeId: generatedIframeNameRef.current,
          appVersion: serverInfo?.appVersion,
        })
        setCurrentPlugin(plugin?.name || null)
        return
      }
      executeCommand(view.activationMethod)
    }
  }, [result, id])

  return (
    <div
      className={cx(
        'queryResultsContainer',
        'pluginStyles',
        styles.pluginWrapperResult,
      )}
    >
      <div data-testid="query-plugin-result">
        <iframe
          seamless
          className={cx('pluginIframe', styles.pluginIframe, {
            [styles.hidden]: !currentPlugin || !isPluginLoaded || !!error,
          })}
          title={id}
          ref={pluginIframeRef}
          src="about:blank"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts"
          data-testid="pluginIframe"
        />
        {!!error && (
          <div className={styles.container}>
            <RiFlexItem grow className="query-card-output-response-fail">
              <span data-testid="query-card-no-module-output">
                <span className={styles.alertIconWrapper}>
                  <RiIcon
                    type="ToastDangerIcon"
                    color="danger600"
                    style={{ display: 'inline', marginRight: 10 }}
                  />
                </span>
                <RiColorText color="danger">{error}</RiColorText>
              </span>
            </RiFlexItem>
          </div>
        )}
        {!isPluginLoaded && (
          <div>
            <RiLoadingContent lines={5} />
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(QueryCardCliPlugin)
