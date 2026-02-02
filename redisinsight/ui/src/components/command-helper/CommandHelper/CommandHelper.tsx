import React, { ReactElement } from 'react'
import { useDispatch } from 'react-redux'
import { CommandGroup } from 'uiSrc/constants'
import { goBackFromCommand } from 'uiSrc/slices/cli/cli-settings'
import { getDocUrlForCommand } from 'uiSrc/utils'
import { Text } from 'uiSrc/components/base/text'

import { Link } from 'uiSrc/components/base/link/Link'
import CHCommandInfo from '../components/command-helper-info'
import CHSearchWrapper from '../components/command-helper-search'
import CHSearchOutput from '../components/command-helper-search-output'

import * as S from './CommandHelper.styles'

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
        target="_blank"
        data-testid="read-more"
        size="S"
        variant="inline"
        color="primary"
      >
        Read more
      </Link>
    )
  }

  return (
    <S.Container data-testid="cli-helper">
      <S.SearchWrapper>
        <CHSearchWrapper />
      </S.SearchWrapper>
      {isSearching && (
        <S.OutputWrapper>
          <CHSearchOutput searchedCommands={searchedCommands} />
        </S.OutputWrapper>
      )}
      {!isSearching && (
        <S.OutputWrapper>
          {commandLine && (
            <div style={{ width: '100%' }}>
              <CHCommandInfo
                args={argString}
                group={group}
                complexity={complexityShort}
                onBackClick={handleBackClick}
              />
              {summary && (
                <Text data-testid="cli-helper-summary">
                  <S.Summary>
                    <span style={{ paddingRight: 5 }}>{summary}</span>{' '}
                    {readMore(commandLine)}
                  </S.Summary>
                </Text>
              )}
              {!!argList.length && (
                <S.Field data-testid="cli-helper-arguments">
                  <Text color="primary">
                    <S.FieldTitle>Arguments:</S.FieldTitle>
                  </Text>
                  {argList}
                </S.Field>
              )}
              {since && (
                <S.Field data-testid="cli-helper-since">
                  <Text color="primary">
                    <S.FieldTitle>Since:</S.FieldTitle>
                  </Text>
                  {since}
                </S.Field>
              )}
              {!complexityShort && complexity && (
                <S.Field data-testid="cli-helper-complexity">
                  <Text color="primary">
                    <S.FieldTitle>Complexity:</S.FieldTitle>
                  </Text>
                  {complexity}
                </S.Field>
              )}
            </div>
          )}
          {!commandLine && (
            <S.DefaultScreen>
              <Text color="primary" data-testid="cli-helper-default">
                Enter any command in CLI or use search to see detailed
                information.
              </Text>
            </S.DefaultScreen>
          )}
        </S.OutputWrapper>
      )}
    </S.Container>
  )
}

export default CommandHelper
