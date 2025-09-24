import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { generateArgsNames } from 'uiSrc/utils'
import { setSearchedCommand } from 'uiSrc/slices/cli/cli-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import styles from './styles.module.scss'

export interface Props {
  searchedCommands: string[]
}

const UnderlineReverseLink = styled(Link)`
  text-decoration: underline !important;

  &:hover {
    text-decoration: none !important;
  }
`

const CHSearchOutput = ({ searchedCommands }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()
  const { spec: ALL_REDIS_COMMANDS } = useSelector(appRedisCommandsSelector)

  const handleClickCommand = (
    e: React.MouseEvent<HTMLAnchorElement>,
    command: string,
  ) => {
    e.preventDefault()
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_COMMAND_OPENED,
      eventData: {
        databaseId: instanceId,
        command,
      },
    })
    dispatch(setSearchedCommand(command))
  }

  const renderDescription = (command: string) => {
    const args = ALL_REDIS_COMMANDS[command].arguments || []
    if (args.length) {
      const argString = generateArgsNames(
        ALL_REDIS_COMMANDS[command]?.provider,
        args,
      ).join(' ')
      return (
        <Text
          size="s"
          className={styles.description}
          data-testid={`cli-helper-output-args-${command}`}
        >
          {argString}
        </Text>
      )
    }
    return (
      <Text
        size="s"
        color="primary"
        className={cx(styles.description, styles.summary)}
        data-testid={`cli-helper-output-summary-${command}`}
      >
        {ALL_REDIS_COMMANDS[command].summary}
      </Text>
    )
  }

  return (
    <>
      {searchedCommands.length > 0 && (
        <div style={{ width: '100%' }}>
          {searchedCommands.map((command: string) => (
            <Row gap="m" key={command} align="center">
              <FlexItem style={{ flexShrink: 0 }}>
                <Text
                  key={command}
                  size="s"
                  data-testid={`cli-helper-output-title-${command}`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    handleClickCommand(e, command)
                  }}
                >
                  <UnderlineReverseLink color="text" variant="regular">
                    {command}
                  </UnderlineReverseLink>
                </Text>
              </FlexItem>
              <FlexItem style={{ flexDirection: 'row', overflow: 'hidden' }}>
                <Text color="text" size="s">
                  {renderDescription(command)}
                </Text>
              </FlexItem>
            </Row>
          ))}
        </div>
      )}
      {searchedCommands.length === 0 && (
        <div className={styles.defaultScreen}>
          <Text data-testid="search-cmds-no-results">No results found.</Text>
        </div>
      )}
    </>
  )
}

export default CHSearchOutput
