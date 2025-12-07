import React, { useEffect } from 'react'
import { findIndex } from 'lodash'
import { useDispatch } from 'react-redux'

import { ICommandArg } from 'uiSrc/constants'
import { generateArgsNames } from 'uiSrc/utils'
import {
  setMatchedCommand,
  clearSearchingCommand,
} from 'uiSrc/slices/cli/cli-settings'

import styles from './styles.module.scss'

export interface Props {
  provider: string
  commandName: string
  wordsTyped: number
  arguments?: ICommandArg[]
}

const CliAutocomplete = (props: Props) => {
  const {
    commandName = '',
    provider = '',
    arguments: args = [],
    wordsTyped,
  } = props

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setMatchedCommand(commandName))
    dispatch(clearSearchingCommand())
  }, [commandName])

  useEffect(
    () => () => {
      dispatch(setMatchedCommand(''))
      dispatch(clearSearchingCommand())
    },
    [],
  )

  let argsList: any[] | string = []
  let untypedArgs: any[] | string = []

  const getUntypedArgs = () => {
    const firstOptionalArgIndex = findIndex(argsList, (arg: string = '') =>
      arg.toString().includes('['),
    )

    const isOnlyOptionalLeft =
      wordsTyped - commandName.split(' ').length >= firstOptionalArgIndex &&
      firstOptionalArgIndex > -1

    if (isOnlyOptionalLeft) {
      return firstOptionalArgIndex
    }

    return wordsTyped - commandName.split(' ').length
  }

  if (args.length) {
    argsList = generateArgsNames(provider, args)

    untypedArgs = argsList.slice(getUntypedArgs()).join(' ')
    argsList = argsList.join(' ')
  }

  return (
    <>
      {!!args.length && argsList && untypedArgs && (
        <span
          className={styles.container}
          data-testid="cli-command-autocomplete"
        >
          <span className={styles.params}>{untypedArgs}</span>
        </span>
      )}
    </>
  )
}

export default CliAutocomplete
