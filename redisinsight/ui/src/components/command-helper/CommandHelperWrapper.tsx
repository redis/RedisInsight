import React, { ReactElement, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { CommandGroup, ICommand, ICommandArgGenerated } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import {
  generateArgs,
  generateArgsNames,
  getComplexityShortNotation,
  removeDeprecatedModuleCommands,
  checkDeprecatedModuleCommand,
} from 'uiSrc/utils'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'

import CommandHelper from './CommandHelper'
import CommandHelperHeader from './CommandHelperHeader'

import * as S from './CommandHelper.styles'

const CommandHelperWrapper = () => {
  const {
    matchedCommand = '',
    searchedCommand = '',
    isSearching,
    isEnteringCommand,
    searchingCommand,
    searchingCommandFilter,
  } = useSelector(cliSettingsSelector)
  const { spec: ALL_REDIS_COMMANDS, commandsArray } = useSelector(
    appRedisCommandsSelector,
  )
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const lastMatchedCommand =
    isEnteringCommand &&
    matchedCommand &&
    !checkDeprecatedModuleCommand(matchedCommand)
      ? matchedCommand
      : searchedCommand

  const KEYS_OF_COMMANDS = useMemo(
    () => removeDeprecatedModuleCommands(commandsArray),
    [commandsArray],
  )
  let searchedCommands: string[] = []

  useEffect(() => {
    if (!isSearching && isEnteringCommand && matchedCommand) {
      sendEventTelemetry({
        event: TelemetryEvent.COMMAND_HELPER_INFO_DISPLAYED_FOR_CLI_INPUT,
        eventData: {
          databaseId: instanceId,
          command: matchedCommand,
        },
      })
    }
  }, [isSearching, isEnteringCommand, matchedCommand])

  const {
    arguments: args = [],
    summary = '',
    group = CommandGroup.Generic,
    complexity = '',
    since = '',
    provider,
  }: ICommand = ALL_REDIS_COMMANDS[lastMatchedCommand.toUpperCase()] ?? {}

  if (isSearching) {
    searchedCommands = KEYS_OF_COMMANDS.filter((command) => {
      const isSuitableForFilter = searchingCommandFilter
        ? ALL_REDIS_COMMANDS[command].group === searchingCommandFilter
        : true
      return (
        isSuitableForFilter &&
        command.toLowerCase().indexOf(searchingCommand.toLowerCase()) > -1
      )
    })
  }

  const generatedArgs = generateArgs(provider, args)
  const complexityShort = getComplexityShortNotation(complexity)
  const argString = [
    lastMatchedCommand.toUpperCase(),
    ...generateArgsNames(provider, args),
  ].join(' ')

  const generateArgData = (
    arg: ICommandArgGenerated,
    i: number,
  ): ReactElement => {
    const type = arg.multiple
      ? 'Multiple'
      : arg.optional
        ? 'Optional'
        : 'Required'
    return (
      <S.Arg justify="between" align="center" $odd={i % 2 === 1} key={i}>
        <FlexItem>
          <S.Badge
            as={RiBadge}
            variant="light"
            className="text-capitalize"
            label={type}
          />
        </FlexItem>
        <FlexItem grow>{arg.generatedName}</FlexItem>
      </S.Arg>
    )
  }

  return (
    <S.CommandHelperWrapper data-testid="command-helper">
      <CommandHelperHeader />
      <CommandHelper
        commandLine={lastMatchedCommand}
        searchedCommands={searchedCommands}
        isSearching={isSearching}
        argString={argString}
        summary={summary}
        group={group}
        since={since}
        complexity={complexity}
        complexityShort={complexityShort}
        argList={generatedArgs.map((obj, i) => generateArgData(obj, i))}
      />
    </S.CommandHelperWrapper>
  )
}

export default React.memo(CommandHelperWrapper)
