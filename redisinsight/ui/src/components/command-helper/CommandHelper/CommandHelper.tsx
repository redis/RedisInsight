import React, { ReactElement } from 'react'
import { useDispatch } from 'react-redux'
import { CommandGroup } from 'uiSrc/constants'
import { goBackFromCommand } from 'uiSrc/slices/cli/cli-settings'
import { getDocUrlForCommand } from 'uiSrc/utils'
import { ColorText, Text } from 'uiSrc/components/base/text'

import { Link } from 'uiSrc/components/base/link/Link'
import CHCommandInfo from '../components/command-helper-info'
import CHSearchWrapper from '../components/command-helper-search'
import CHSearchOutput from '../components/command-helper-search-output'

import styles from './styles.module.scss'

export interface Props {
  commandLine: string
  isSearching: boolean
  searchedCommands: string[]
  argString: string
  argList: ReactElement[]
  summary: string
  group: CommandGroup | string
  complexity: string
  complexityShort: string
  since: string
}

const CommandHelper = (props: Props) => {
  const {
    commandLine = '',
    isSearching = false,
    searchedCommands = [],
    argString = '',
    argList = [],
    summary = '',
    group = CommandGroup.Generic,
    complexity = '',
    complexityShort = '',
    since = '',
  } = props

  const dispatch = useDispatch()
  const handleBackClick = () => dispatch(goBackFromCommand())

  const readMore = (commandName = '') => {
    const docUrl = getDocUrlForCommand(commandName)
    return (
      <Link
        href={docUrl}
        className={styles.link}
        target="_blank"
        data-testid="read-more"
      >
        Read more
      </Link>
    )
  }

  return (
    <div className={styles.container} data-testid="cli-helper">
      <div className={styles.searchWrapper}>
        <CHSearchWrapper />
      </div>
      {isSearching && (
        <div className={styles.outputWrapper}>
          <CHSearchOutput searchedCommands={searchedCommands} />
        </div>
      )}
      {!isSearching && (
        <div className={styles.outputWrapper}>
          {commandLine && (
            <div style={{ width: '100%' }}>
              <CHCommandInfo
                args={argString}
                group={group}
                complexity={complexityShort}
                onBackClick={handleBackClick}
              />
              {summary && (
                <Text
                  className={styles.summary}
                  data-testid="cli-helper-summary"
                >
                  <span style={{ paddingRight: 5 }}>{summary}</span>{' '}
                  {readMore(commandLine)}
                </Text>
              )}
              {!!argList.length && (
                <div
                  className={styles.field}
                  data-testid="cli-helper-arguments"
                >
                  <Text color="primary" className={styles.fieldTitle}>
                    Arguments:
                  </Text>
                  {argList}
                </div>
              )}
              {since && (
                <div className={styles.field} data-testid="cli-helper-since">
                  <Text color="primary" className={styles.fieldTitle}>
                    Since:
                  </Text>
                  {since}
                </div>
              )}
              {!complexityShort && complexity && (
                <div
                  className={styles.field}
                  data-testid="cli-helper-complexity"
                >
                  <Text color="primary" className={styles.fieldTitle}>
                    Complexity:
                  </Text>
                  {complexity}
                </div>
              )}
            </div>
          )}
          {!commandLine && (
            <Text
              color="primary"
              className={styles.defaultScreen}
              data-testid="cli-helper-default"
            >
              Enter any command in CLI or use search to see detailed
              information.
            </Text>
          )}
        </div>
      )}
    </div>
  )
}

export default CommandHelper
