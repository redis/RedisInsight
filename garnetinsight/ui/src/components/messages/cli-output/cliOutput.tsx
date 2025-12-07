import React, { Fragment } from 'react'
import { getRouterLinkProps } from 'uiSrc/services'
import { getDbIndex } from 'uiSrc/utils'
import { FeatureFlagComponent } from 'uiSrc/components'
import { ColorText } from 'uiSrc/components/base/text'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { Link } from 'uiSrc/components/base/link/Link'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

export const InitOutputText = (
  host: string = '',
  port: number = 0,
  dbIndex: number = 0,
  emptyOutput: boolean,
  onClick: () => void,
) => [
  <Fragment key={Math.random()}>
    {emptyOutput && (
      <span className="color-green" key={Math.random()}>
        {'Try '}
        <Link
          onClick={onClick}
          className="color-green"
          style={{ fontSize: 'inherit', fontFamily: 'inherit' }}
          data-test-subj="cli-workbench-page-btn"
        >
          Workbench
        </Link>
        , our advanced CLI. Check out our Quick Guides to learn more about Garnet
        capabilities.
      </span>
    )}
  </Fragment>,
  '\n\n',
  'Connecting...',
  '\n\n',
  'Pinging Redis server on ',
  <ColorText
    component="span"
    color="default"
    key={Math.random()}
    className="font-inconsolata"
  >
    {`${host}:${port}${getDbIndex(dbIndex)}`}
  </ColorText>,
]

export const ConnectionSuccessOutputText = [
  '\n',
  'Connected.',
  '\n',
  'Ready to execute commands.',
  '\n\n',
]

const unsupportedCommandTextCli =
  ' is not supported by the Garnet Insight CLI. The list of all unsupported commands: '
const unsupportedCommandTextWorkbench =
  ' is not supported by the Workbench. The list of all unsupported commands: '
export const cliTexts = {
  CLI_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextCli + commands,
  WORKBENCH_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextWorkbench + commands,
  REPEAT_COUNT_INVALID: 'Invalid repeat command option value',
  CONNECTION_CLOSED:
    'Client connection previously closed. Run the command after the connection is re-created.',
  UNABLE_TO_DECRYPT:
    'Unable to decrypt. Check the system keychain or re-run the command.',
  PUB_SUB_NOT_SUPPORTED_ENV: (
    <div
      className="cli-output-response-fail"
      data-testid="user-pub-sub-link-disabled"
    >
      PubSub not supported in this environment.
    </div>
  ),
  USE_PSUBSCRIBE_COMMAND: (path: string = '') => (
    <ColorText color="danger" key={Date.now()} data-testid="user-pub-sub-link">
      {'Use '}
      <Link
        {...getRouterLinkProps(path)}
        color="text"
        data-test-subj="pubsub-page-btn"
      >
        Pub/Sub
      </Link>
      {' to see the messages published to all channels in your database.'}
    </ColorText>
  ),
  PSUBSCRIBE_COMMAND: (path: string = '') => (
    <FeatureFlagComponent
      name={FeatureFlags.envDependent}
      otherwise={cliTexts.PUB_SUB_NOT_SUPPORTED_ENV}
    >
      {cliTexts.USE_PSUBSCRIBE_COMMAND(path)}
    </FeatureFlagComponent>
  ),
  PSUBSCRIBE_COMMAND_CLI: (path: string = '') => [
    cliTexts.PSUBSCRIBE_COMMAND(path),
    '\n',
  ],
  MONITOR_NOT_SUPPORTED_ENV: (
    <div
      className="cli-output-response-fail"
      data-testid="user-profiler-link-disabled"
    >
      Monitor not supported in this environment.
    </div>
  ),
  USE_PROFILER_TOOL: (onClick: () => void) => (
    <ColorText color="danger" key={Date.now()}>
      {'Use '}
      <EmptyButton
        onClick={onClick}
        className="btnLikeLink"
        color="text"
        data-testid="monitor-btn"
      >
        Profiler
      </EmptyButton>
      {' tool to see all the requests processed by the server.'}
    </ColorText>
  ),
  MONITOR_COMMAND: (onClick: () => void) => (
    <FeatureFlagComponent
      name={FeatureFlags.envDependent}
      otherwise={cliTexts.MONITOR_NOT_SUPPORTED_ENV}
    >
      {cliTexts.USE_PROFILER_TOOL(onClick)}
    </FeatureFlagComponent>
  ),
  USE_PUB_SUB_TOOL: (path: string = '') => (
    <ColorText color="danger" key={Date.now()} data-testid="user-pub-sub-link">
      {'Use '}
      <Link
        {...getRouterLinkProps(path)}
        color="text"
        data-test-subj="pubsub-page-btn"
      >
        Pub/Sub
      </Link>
      {' tool to subscribe to channels.'}
    </ColorText>
  ),
  SUBSCRIBE_COMMAND_CLI: (path: string = '') => (
    <FeatureFlagComponent
      name={FeatureFlags.envDependent}
      otherwise={cliTexts.PUB_SUB_NOT_SUPPORTED_ENV}
    >
      {cliTexts.USE_PUB_SUB_TOOL(path)}
    </FeatureFlagComponent>
  ),
  HELLO3_COMMAND: () => (
    <ColorText color="danger" key={Date.now()}>
      {'Garnet Insight does not support '}
      <Link
        href="https://github.com/redis/redis-specifications/blob/master/protocol/RESP3.md"
        className="btnLikeLink"
        color="text"
        target="_blank"
        data-test-subj="hello3-btn"
      >
        RESP3
      </Link>
      {' at the moment, but we are working on it.'}
    </ColorText>
  ),
  HELLO3_COMMAND_CLI: () => [cliTexts.HELLO3_COMMAND(), '\n'],
  CLI_ERROR_MESSAGE: (message: string) => [
    '\n',
    <ColorText color="danger" key={Date.now()}>
      {message}
    </ColorText>,
    '\n\n',
  ],
}
