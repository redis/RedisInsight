import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import parse from 'html-react-parser'
import { monaco } from 'react-monaco-editor'

import { CodeBlock } from 'uiSrc/components'
import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import { MonacoLanguage } from 'uiSrc/constants'

export interface Props {
  target?: string
}

const NO_COMMANDS_MESSAGE = 'No Redis commands provided by the server.'

const DryRunJobCommands = ({ target }: Props) => {
  const { results } = useSelector(rdiDryRunJobSelector)
  const [commands, setCommands] = useState<string>('')

  useEffect(() => {
    if (!results) {
      return
    }

    try {
      const targetCommands = results?.output?.find(
        (el) => el.connection === target,
      )?.commands

      if (!targetCommands) {
        setCommands(NO_COMMANDS_MESSAGE)
        return
      }
      monaco.editor
        .colorize(
          (targetCommands ?? []).join('\n').trim(),
          MonacoLanguage.Redis,
          {},
        )
        .then((data) => {
          setCommands(data)
        })
    } catch (e) {
      setCommands(NO_COMMANDS_MESSAGE)
    }
  }, [results, target])

  return (
    <div className="rdi-dry-run__codeBlock" data-testid="commands-output">
      <CodeBlock className="rdi-dry-run__code">{parse(commands)}</CodeBlock>
    </div>
  )
}

export default DryRunJobCommands
