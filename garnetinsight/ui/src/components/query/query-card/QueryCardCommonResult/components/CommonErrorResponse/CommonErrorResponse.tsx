import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  checkUnsupportedCommand,
  checkUnsupportedModuleCommand,
  cliParseTextResponse,
  CliPrefix,
  getCommandRepeat,
  isRepeatCountCorrect,
} from 'uiSrc/utils'
import { ModuleNotLoaded } from 'uiSrc/components'
import { cliTexts } from 'uiSrc/components/messages/cli-output/cliOutput'
import { SelectCommand } from 'uiSrc/constants/cliOutput'
import {
  CommandMonitor,
  CommandPSubscribe,
  CommandSubscribe,
  CommandHello3,
  Pages,
} from 'uiSrc/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { showMonitor } from 'uiSrc/slices/cli/monitor'

const CommonErrorResponse = (id: string, command = '', result?: any) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { unsupportedCommands: cliUnsupportedCommands, blockingCommands } =
    useSelector(cliSettingsSelector)
  const { modules } = useSelector(connectedInstanceSelector)
  const dispatch = useDispatch()
  const unsupportedCommands = [
    SelectCommand.toLowerCase(),
    ...cliUnsupportedCommands,
    ...blockingCommands,
  ]
  const [commandLine, countRepeat] = getCommandRepeat(command || '')

  // Flow if MONITOR command was executed
  if (checkUnsupportedCommand([CommandMonitor.toLowerCase()], commandLine)) {
    return cliTexts.MONITOR_COMMAND(() => {
      dispatch(showMonitor())
    })
  }
  // Flow if SUBSCRIBE command was executed
  if (checkUnsupportedCommand([CommandSubscribe.toLowerCase()], commandLine)) {
    return cliTexts.SUBSCRIBE_COMMAND_CLI(Pages.pubSub(instanceId))
  }
  // Flow if PSUBSCRIBE command was executed
  if (checkUnsupportedCommand([CommandPSubscribe.toLowerCase()], commandLine)) {
    return cliTexts.PSUBSCRIBE_COMMAND(Pages.pubSub(instanceId))
  }

  // Flow if HELLO 3 command was executed
  if (checkUnsupportedCommand([CommandHello3.toLowerCase()], commandLine)) {
    return cliTexts.HELLO3_COMMAND()
  }

  const unsupportedCommand = checkUnsupportedCommand(
    unsupportedCommands,
    commandLine,
  )

  if (result === null) {
    return cliParseTextResponse(
      cliTexts.UNABLE_TO_DECRYPT,
      '',
      CommandExecutionStatus.Fail,
      CliPrefix.QueryCard,
    )
  }

  if (!isRepeatCountCorrect(countRepeat)) {
    return cliParseTextResponse(
      cliTexts.REPEAT_COUNT_INVALID,
      commandLine,
      CommandExecutionStatus.Fail,
      CliPrefix.QueryCard,
    )
  }

  if (unsupportedCommand) {
    return cliParseTextResponse(
      cliTexts.WORKBENCH_UNSUPPORTED_COMMANDS(
        commandLine.slice(0, unsupportedCommand.length),
        [...blockingCommands, ...unsupportedCommands].join(', '),
      ),
      commandLine,
      CommandExecutionStatus.Fail,
    )
  }
  const unsupportedModule = checkUnsupportedModuleCommand(modules, commandLine)

  if (unsupportedModule) {
    return <ModuleNotLoaded moduleName={unsupportedModule} id={id} />
  }

  return null
}

export default CommonErrorResponse
